import React from "react";
import styles from "./App.module.css";
import { get } from "axios";
import throttle from "lodash.throttle";
import LRU from "quick-lru";

const queryCache = new LRU({ maxSize: 100 });

export default function App() {
  const [data, setDataState] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const queryRef = React.useRef("");
  const setData = React.useCallback(
    d => {
      setDataState(d);
      setError("");
    },
    [setDataState, setError]
  );
  const fetchQuery = React.useCallback(
    throttle(async value => {
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
        // prevent races
        if (queryRef.current === value) {
          setData(data.predictions);
        }
        queryCache.set(value, data.predictions);
      } catch (e) {
        setError(e.toString());
      }
      setLoading(false);
    }, 50),
    [setData]
  );
  const onChange = React.useCallback(
    ({ target: { value } }) => {
      queryRef.current = value;
      fetchQuery(value);
    },
    [fetchQuery, queryRef]
  );

  return (
    <div className={styles.container}>
      <input type="search" onChange={onChange} value={queryRef.current} />
      {loading && <mark>…</mark>}
      {error ? (
        <div>{error}</div>
      ) : (
        <ul className={styles.list}>
          {data.map(({ id, structured_formatting: { main_text: text } }) => (
            // TODO: keybaord nav
            <li
              key={id}
              onMouseDown={() => {
                onChange({ target: { value: text } });
              }}
            >
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
