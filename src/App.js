import "./styles.css";
import { useState, useRef, useEffect } from "react";
import emailjs from "emailjs-com";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  QuerySnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const App = () => {
  const [dataArray, setDataArray] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const form = useRef();

  //fetch from firebase
  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "phoneNumbers"),
        where("sent", "==", false)
      );
      const QuerySnapshot = await getDocs(q);
      const numbers = QuerySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setDataArray(numbers);
    };

    fetchData();
  }, []);

  //User cooldown store in local storage
  useEffect(() => {
    const lastSubmissionTime = localStorage.getItem("lastSubmissionTime");
    if (lastSubmissionTime) {
      const timeDiff =
        Date.now() - new Date(parseInt(lastSubmissionTime)).getTime();
      if (timeDiff < 172800000) {
        setCanSubmit(false);
      }
    }
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    if (!canSubmit) {
      alert("You can only submit one request every 24 hours.");
      return;
    }

    if (!selectedItem) {
      console.log("No item selected for sending.");
      setIsSubmitted(true);
      return;
    }

    emailjs
      .sendForm(
        "service_p30k3pz",
        "template_gtnk03c",
        form.current,
        "myW_exMrmnw4SGeeX"
      )
      .then(
        async (result) => {
          console.log(result.text);

          const docRef = doc(db, "phoneNumbers", selectedItem.id);
          await updateDoc(docRef, { sent: true });
          setIsSubmitted(true);
          localStorage.setItem("lastSubmissionTime", Date.now().toString());
          setCanSubmit(false);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  const handleShow = () => {
    if (dataArray.length > 0) {
      const item = dataArray[0];
      setSelectedItem(item);
    }
    setShowForm(!showForm);
  };

  return (
    <div className="App">
      <div className="main-flex">
        <div className="small-container">
          <img src="./img/gas-request.png" className="logo" alt="logo" />
          <div className="title">
            <h2>COUPON $1 Off/Gallon</h2>
            <span>Price: FREE</span>
            <span>
              
            </span>
            <button className="button-7" onClick={handleShow}>
              {!showForm ? "REQUEST" : "CLOSE"}
            </button>
          </div>
        </div>
      </div>
      {showForm && !isSubmitted && canSubmit && (
        <form className="form" ref={form} onSubmit={sendEmail}>
          <div className="form-container">
            <label htmlFor="email">Email</label>
            <input type="email" className="input" id="email" name="email" />
            <lable htmlFor="code">Access Code</lable>
            <input type="code" className="input" id="code" name="code" />
            <input
              type="hidden"
              name="custom_message"
              value={dataArray.length > 0 ? dataArray[0].number : ""}
            />
          </div>
          <button className="button-7" type="submit">
            SUBMIT
          </button>
          <span>
            *Please use your real email address when submitting the form.
            Otherwise, the reward # can't be sent successfully.
          </span>
        </form>
      )} 
      {isSubmitted && (
        <p>
          Congratulations! Your form has been submitted. Please kindly request
          only 1 reward number per 48 hours. Thank you.{" "}
          <span>
            If you did not receive an email within 2 minutes, please check your
            spam folder.
          </span>
        </p>
      )}
      {!canSubmit && (
        <p>
          <strong></strong>You have submitted a form recently. Please wait 48
          hours after you last submitted before submitting the form again.
        </p>
      )}
    </div>
  );
};

export default App;
