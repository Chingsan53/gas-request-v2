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
  const [tokens, setTokens] = useState(0);
  const [email, setEmail] = useState("");

  const form = useRef();
  // Automatically refresh the page
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 2 * 60 * 1000); // 2 minutes in milliseconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

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

  //Fetch allowed Emails and tokens
  useEffect(() => {
    const fetchEmailTokens = async () => {
      try {
        if (email) {
          const q = query(
            collection(db, "allowedEmails"),
            where("email", "==", email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const allowedEmailDoc = querySnapshot.docs[0];
            setTokens(allowedEmailDoc.data().tokens);
          } else {
            setTokens(0);
          }
        }
      } catch (error) {
        console.error("Error fetching email tokens: ", error);
      }
    };
    fetchEmailTokens();
  }, [email]);

  //User cooldown store in local storage
  useEffect(() => {
    const lastSubmissionTime = localStorage.getItem("lastSubmissionTime");
    if (lastSubmissionTime) {
      const timeDiff =
        Date.now() - new Date(parseInt(lastSubmissionTime)).getTime();
      if (timeDiff < 120000) {
        setCanSubmit(false);
      }
    }
  }, []);

  // Set Email and Update Tokens
  const sendEmail = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      alert("You can only submit one request every 24 hours.");
      return;
    }

    if (tokens <= 0) {
      alert(
        "You have no tokens left. Please wait until they reset next month. Cashapp $Chevvi567 and include your email address on the note to buy. Price: $4 per token. Thanks"
      );
      return;
    }

    if (!selectedItem) {
      console.log("No item selected for sending.");
      setIsSubmitted(true);
      return;
    }

    // Validate email against allowed emails in Firestore
    const q = query(
      collection(db, "allowedEmails"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      alert(
        'You are not registered. Please contact "davidlee239900@gmail.com" to sign up.'
      );
      return;
    }

    try {
      const allowedEmailDoc = querySnapshot.docs[0];
      const newTokens = allowedEmailDoc.data().tokens - 1;
      //update tokens in Firestore after successful form submit
      await updateDoc(doc(db, "allowedEmails", allowedEmailDoc.id), {
        tokens: newTokens,
      });

      setTokens(newTokens);
      emailjs
        .sendForm(
          "service_p30k3pz",
          "template_gtnk03c",
          form.current,
          "myW_exMrmnw4SGeeX"
        )
        .then(async (result) => {
          console.log(result.text);
          const docRef = doc(db, "phoneNumbers", selectedItem.id);
          await updateDoc(doc(db, "phoneNumbers", selectedItem.id), {
            sent: true,
          });
          setIsSubmitted(true);
          localStorage.setItem("lastSubmissionTime", Date.now().toString());
          setCanSubmit(false);
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    } catch (error) {
      console.error("Error updating tokens:", error);
      //Handle error updating tokens (rollback or inform user)
    }
  };

  const handleShow = () => {
    if (dataArray.length > 0) {
      const item = dataArray[0];
      setSelectedItem(item);
    }
    setShowForm(!showForm);
  };

  // const handleAccessCodeSubmit = (e) => {
  //   e.preventDefault();
  //   if (accessCode === "gasbuddy123") {
  //     setIsAccessCodeValid(true);
  //   } else {
  //     alert("Invalid access code. Try again.");
  //   }
  // };

  return (
    <div className="App">
      {/* {!isAccessCodeValid ? (
        <form className="access-code-form" onSubmit={handleAccessCodeSubmit}>
          <label htmlFor="accessCode">Enter Access Code: </label>
          <input
            type="text"
            id="accessCode"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      ) : ( */}
      <>
        <div className="main-flex">
          <div className="small-container">
            <img src="./img/gas-request.png" className="logo" alt="logo" />
            <div className="title">
              <h2>COUPON $1 Off/Gallon</h2>
              <span>
                <strong>Important: </strong>Friends & Family: Get up to 4 free
                tokens monthly, reset at the start of each month. Want more?
                Cashapp: $Chevvi567 to buy. Price: $4 per token.
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
              <input
                type="email"
                className="input"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
              />

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
            Congratulations! Your form has been submitted.{" "}
            <span>Token left: {tokens}</span>
          </p>
        )}
        {!canSubmit && (
          <p>
            <strong>
              You have submitted a form recently. Please wait 2 minutes after
              you last submitted before submitting the form again.
            </strong>{" "}
          </p>
        )}
      </>
      {/* )} */}
    </div>
  );
};

export default App;
