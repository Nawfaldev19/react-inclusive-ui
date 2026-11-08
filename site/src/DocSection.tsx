import type { ReactNode } from "react";

export interface PropRow {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

interface DocSectionProps {
  id: string;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  props?: PropRow[];
  keyboard?: [keys: string, action: string][];
  notes?: string[];
}

/** One documented component: summary, live example, props, keyboard support, and accessibility notes. */
export function DocSection({ id, title, summary, children, props, keyboard, notes }: DocSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="doc-section">
      <h2 id={`${id}-heading`}>{title}</h2>
      <p className="lead">{summary}</p>
      <div className="preview">{children}</div>
      {props && (
        <div className="th-table-wrap">
          <table className="th-table">
            <caption>Props</caption>
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                  </td>
                  <td>
                    <code>{prop.type}</code>
                  </td>
                  <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : "—"}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {keyboard && (
        <>
          <h3>Keyboard</h3>
          <dl className="keys">
            {keyboard.map(([keys, action]) => (
              <div key={keys}>
                <dt>
                  <kbd>{keys}</kbd>
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {notes && (
        <>
          <h3>Accessibility</h3>
          <ul className="notes">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
