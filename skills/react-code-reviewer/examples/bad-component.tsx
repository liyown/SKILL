import { useEffect, useState } from "react";

export function UserTable({ query }: { query: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/users?q=${query}`)
      .then((res) => res.json())
      .then(setRows);
  }, []);

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td dangerouslySetInnerHTML={{ __html: row.nameHtml }} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
