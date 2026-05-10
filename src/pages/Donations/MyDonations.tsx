// import React, { useEffect, useState } from "react";
// import { getMyDonations } from "../../api/ataaApi";

// export default function MyDonationsPage() {
//   const [donations, setDonations] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       const token = localStorage.getItem("accessToken") || "";
//       const { data } = await getMyDonations(token);
//       setDonations(data.data || []);
//       setLoading(false);
//     })();
//   }, []);

//   if (loading) return <div>جاري التحميل...</div>;
//   return (
//     <div>
//       <h2>تبرعاتي</h2>
//       <ul>
//         {donations.map(d =>
//           <li key={d._id}>{d.type} - {d.quantity} - {d.size}</li>
//         )}
//       </ul>
//     </div>
//   );
// }

// src/pages/Donations/MyDonations.tsx — مُصلَح
import React, { useEffect, useState } from "react";
// ✅ استخدام donorApi من services/ بدلاً من ataaApi
import { donorApi, Donation } from "../../services";

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    donorApi
      .getMyDonations()
      // ✅ Backend يُرجع { success, donations } — مش { data }
      .then(res => setDonations(res.donations || []))
      .catch(err => setError(err.message || "حدث خطأ"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>تبرعاتي</h2>
      {donations.length === 0 ? (
        <p>لا توجد تبرعات حتى الآن.</p>
      ) : (
        <ul>
          {donations.map(d => (
            <li key={d._id}>
              {d.type} - {d.quantity} - {d.size} - {d.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}