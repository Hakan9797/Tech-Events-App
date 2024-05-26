import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    // useQuery'den dönen veriler, yükleme durumu, hata durumu ve hata mesajını içerir
    queryKey: ["events", { max: 3 }],
    // Sorgunun benzersiz anahtarı, sorgunun önbelleğe alınmasını ve yeniden kullanılmasını sağlar
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // Sorgu işlevi, fetchEvents'i çağırır ve max: 3'ü iletir. signal, isteği iptal etmek için kullanılır
    staleTime: 5000,
    // Sorgu sonuçlarının tazeliğini 5 saniye boyunca korur. Bu süre içinde sorgu yeniden tetiklenmez
    // gcTime:30000  control cache time
    // Yorum satırı olarak bırakılmış. Bu ayar, önbelleğe alınan verilerin ne kadar süre sonra bellekten temizleneceğini belirler
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
