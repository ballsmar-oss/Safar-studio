import { useState } from "react";
import { useAdminData } from "./useAdminData";

const STAGE_NAMES = {
  kg: "روضة",
  primary: "ابتدائي",
  middle: "متوسط",
  high: "ثانوي",
};

export function AdminSchoolLists({ token: c }) {
  const { data: r, error: o } = useAdminData("/api/admin/school-lists", c);
  const [f, g] = useState(null);
  const m = async (b) => {
    if (b.file) {
      g(b.id);
      try {
        const S = await fetch(b.file, {
          headers: {
            Authorization: `Bearer ${c}`,
          },
        });
        if (!S.ok) {
          throw new Error();
        }
        const y = URL.createObjectURL(await S.blob());
        window.open(y, "_blank", "noopener");
        setTimeout(() => URL.revokeObjectURL(y), 60000);
      } finally {
        g(null);
      }
    }
  };
  if (o) {
    return (
      <p role="alert" className="font-bold text-[#b0354f]">
        {o}
      </p>
    );
  } else if (r) {
    if (r.length === 0) {
      return <p className="lead">ما فيه قوائم مدارس لين الحين.</p>;
    } else {
      return (
        <div className="grid gap-4">
          {r.map((b) => (
            <article key={b.id} className="panel p-5 grid gap-2">
              <p className="m-0 font-bold">
                #{b.id}
                {" · "}
                {b.name}
                {" · "}
                <span dir="ltr">{b.phone}</span>
                {" · "}
                {STAGE_NAMES[b.stage] ?? b.stage}
              </p>
              {b.text && (
                <p className="m-0 text-[15px] whitespace-pre-line">{b.text}</p>
              )}
              {b.file && (
                <button
                  className="btn btn-sm justify-self-start"
                  disabled={f === b.id}
                  onClick={() => m(b)}
                >
                  {f === b.id ? "جاري الفتح…" : "افتح الملف المرفوع"}
                </button>
              )}
            </article>
          ))}
        </div>
      );
    }
  } else {
    return <p className="lead">جاري التحميل…</p>;
  }
}
