import { useId } from "react";

export function Field({ id: c, label: r, error: o, ...f }) {
  const g = useId();
  return (
    <div>
      <label className="label" htmlFor={c}>
        {r}
      </label>
      <input
        id={c}
        name={c}
        className="field"
        aria-invalid={o ? true : undefined}
        aria-describedby={o ? g : undefined}
        {...f}
      />
      {o && (
        <p id={g} className="m-0 mt-1.5 text-[14px] font-bold text-[#b0354f]">
          {o}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  id: c,
  label: r,
  value: o,
  onChange: f,
  children: g,
}) {
  return (
    <div>
      <label className="label" htmlFor={c}>
        {r}
      </label>
      <select
        id={c}
        className="field"
        value={o}
        onChange={(m) => f(m.target.value)}
      >
        {g}
      </select>
    </div>
  );
}
