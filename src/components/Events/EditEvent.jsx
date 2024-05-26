import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate(); // Navigasyon için useNavigate kullanılıyor.
  const params = useParams(); // URL parametrelerini almak için useParams kullanılıyor.

  // useQuery ile veri sorgulama işlemi yapılıyor. Sorgu anahtarı olarak ["events", params.id] kullanılıyor.
  // fetchEvent fonksiyonu, belirtilen id'ye sahip etkinliği getiriyor.
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id], // Sorgu anahtarı.
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }), // Sorgu fonksiyonu.
  });

  // useMutation ile veri güncelleme işlemi yapılıyor.
  const { mutate } = useMutation({
    mutationFn: updateEvent, // Mutasyon (güncelleme) fonksiyonu.
    onMutate: async (data) => {
      const newEvent = data.event; // Güncellenen etkinlik verisi.

      // Sorguları iptal et.
      await queryClient.cancelQueries({ queryKey: ["events", params.id] });
      const previousEvent = queryClient.getQueryData(["events", params.id]); // Önceki etkinlik verisini al.

      // Güncellenmiş etkinlik verisini sorgu önbelleğine yerleştir.
      queryClient.setQueryData(["events", params.id], newEvent);

      return { previousEvent }; // Önceki veriyi döndür.
    },
    onError: (error, data, context) => {
      // Hata durumunda, önceki etkinlik verisini geri yükle.
      queryClient.setQueryData(["events", params.id], context.previousEvent);
    },
    onSettled: () => {
      // Mutasyon tamamlandığında, sorgu verilerini geçersiz kıl.
      queryClient.invalidateQueries(["events", params.id]);
    },
  });

  function handleSubmit(formData) {
    // Form verileriyle güncelleme işlemi gerçekleştir.
    mutate({ id: params.id, event: formData });
    navigate("../"); // Güncelleme sonrası bir üst dizine yönlendir.
  }

  function handleClose() {
    navigate("../"); // Kapatma işlemiyle bir üst dizine yönlendir.
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please check your inputs and try again later."
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
