import React from "react";
import styles from "./App.module.css";
import { get } from "axios";
import throttle from "lodash.throttle";
import LRU from "quick-lru";

const queryCache = new LRU({ maxSize: 100 });

export default function App() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const fetchQuery = React.useCallback(
    throttle(async e => {
      const { value } = e.target;
      if (!value) {
        setData([]);
        return;
      }
      if (queryCache.has(value)) {
        setData(queryCache.get(value));
        return;
      }
      setLoading(true);
      try {
        const { data } = await get("/api?q=" + value);
        setData(data.predictions);
        queryCache.set(value, data.predictions);
      } catch (e) {
        setError(e.toString());
      }
      setLoading(false);
    }, 50),
    [setData]
  );
  return (
    <div className={styles.container}>
      <input type="search" onInput={fetchQuery} />
      {loading && <mark>…</mark>}
      {error ? (
        <div>{error}</div>
      ) : (
        <ul className={styles.list}>
          {data.map(({ id, structured_formatting: { main_text: text } }) => (
            <li key={id}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
