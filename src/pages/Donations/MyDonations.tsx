import React, { useEffect, useState } from "react";
import { getMyDonations } from "../../api/ataaApi";

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("accessToken") || "";
      const { data } = await getMyDonations(token);
      setDonations(data.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  return (
    <div>
      <h2>تبرعاتي</h2>
      <ul>
        {donations.map(d =>
          <li key={d._id}>{d.type} - {d.quantity} - {d.size}</li>
        )}
      </ul>
    </div>
  );
}