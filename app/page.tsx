"use client";

import { useEffect, useState } from "react";

import { auth, provider, db } from "@/lib/firebase";


import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";


export default function Home() {

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState("alloy");
  const [credits, setCredits] = useState(1200);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billing, setBilling] = useState("monthly");
  const [activePage, setActivePage] = useState("home");
  const [history, setHistory] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {

  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {

      setUser(currentUser);

      if (currentUser) {

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

          const data = userSnap.data();

          setCredits(data.credits);
          await loadHistory(currentUser.uid);

        } else {

          await setDoc(userRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            credits: 1200,
          });

          setCredits(1200);
          setHistory([]);

        }
      }
    }
  );

  return () => unsubscribe();

}, []);

  const loginWithGoogle = async () => {

    try {

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(result.user);

      alert("Login Successful");

    } catch (error) {

      console.log(error);

    }
  };

  const loadHistory = async (uid: string) => {

 const q = query(
  collection(db, "history"),
  where("uid", "==", uid),
  
  orderBy("createdAt", "desc")
);

  const snapshot = await getDocs(q);

  const items: any[] = [];

  snapshot.forEach((doc) => {

    items.push({
      id: doc.id,
      ...doc.data(),
    });

  });

  setHistory(items);

};
  const logout = async () => {

    await signOut(auth);

  };

  const generateAudio = async () => {

    if (!text) return;

    if (text.length > credits) {

      alert("Not enough credits");

      return;

    }

    try {

      setLoading(true);

      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  text,
  voice,
  uid: user?.uid,
}),
      });

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      setAudioUrl(url);

      const userRef = doc(
  db,
  "users",
  user.uid
);

const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  setCredits(userSnap.data().credits);
}
await loadHistory(user.uid);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

     <div className="absolute top-6 left-6 z-50">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl"
  >
    ☰
  </button>
</div>

{menuOpen && (
  <div className="fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 p-6 z-40">

    <button
  onClick={() => setMenuOpen(false)}
  className="mb-6 bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-700"
>
  ✕ 
</button>

    {user && (
  <div className="mb-8 border-b border-zinc-700 pb-4">

    <img
      src={user?.photoURL}
      alt="profile"
      className="w-14 h-14 rounded-full mb-3"
    />

    <p className="font-bold">
      {user?.displayName}
    </p>

    <p className="text-sm text-zinc-400">
      Credits: {credits}
    </p>

  </div>
)}

    <div className="flex flex-col gap-4">

      <button
  onClick={() => {
    setActivePage("home");
    setMenuOpen(false);
  }}
  className="text-left"
>
  🏠 Home
</button>
<button
  onClick={() => {
    setActivePage("history");
    setMenuOpen(false);
  }}
  className="text-left"
>
  📜 History
</button>

      <button
  onClick={() => {
    setActivePage("plans");
    setMenuOpen(false);
  }}
  className="text-left"
>
  💎 Plans
</button>
<button
  onClick={() => {
    setActivePage("payments");
    setMenuOpen(false);
  }}
  className="text-left"
>
  💳 Payments
</button>
<button
  onClick={() => {
    setActivePage("about");
    setMenuOpen(false);
  }}
  className="text-left"
>
  ℹ️ About Us
</button>

<button
  onClick={() => {
    setActivePage("contact");
    setMenuOpen(false);
  }}
  className="text-left"
>
  📧 Contact Us
</button>

<button
  onClick={() => {
    setActivePage("privacy");
    setMenuOpen(false);
  }}
  className="text-left"
>
  🔒 Privacy Policy
</button>

<button
  onClick={() => {
    setActivePage("terms");
    setMenuOpen(false);
  }}
  className="text-left"
>
  📄 Terms & Conditions
</button>

<button
  onClick={() => {
    setActivePage("refund");
    setMenuOpen(false);
  }}
  className="text-left"
>
  💰 Refund Policy
</button>



      <button
        onClick={logout}
        className="text-left text-red-400"
      >
        🚪 Logout
      </button>

    </div>

  </div>
)}

      <div className="absolute top-6 right-6">

        {user ? (

          <div className="flex items-center gap-3">

            <img
  src={user?.photoURL || "https://i.pravatar.cc/100"}
  alt="profile"
  className="w-10 h-10 rounded-full border border-zinc-700"
/>

            <button
              onClick={logout}
              className="bg-white text-black px-4 py-2 rounded-xl font-semibold"
            >
              Logout
            </button>

          </div>

        ) : (
              
          <button
            onClick={loginWithGoogle}
            className="bg-white text-black px-5 py-2 rounded-xl font-semibold"
          >
            Login
          </button>

        )}

      </div>
{activePage === "history" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      History
    </h1>

    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">

  {history.length === 0 ? (

    <p className="text-zinc-400">
      No history found
    </p>

  ) : (

    
    <div className="flex flex-col gap-4">

      {history.map((item) => (

        <div
          key={item.id}
          className="border border-zinc-700 rounded-2xl p-4"
        >

          <p className="font-semibold">
            {item.text}
          </p>

          <p className="text-zinc-400 text-sm mt-2">
            Voice: {item.voice}
          </p>

          <p className="text-zinc-400 text-sm">
            Characters: {item.characters}
          </p>
          <p className="text-zinc-500 text-xs mt-2">
  {item.createdAt?.toDate
    ? item.createdAt.toDate().toLocaleString()
    : "Unknown Date"}
</p>

        </div>

      ))}

    </div>

  )}

</div>

  </div>
)}




{activePage === "plans" && (
  <div className="w-full max-w-6xl">

    <h1 className="text-5xl font-bold mb-10 text-center">
      Choose Your Plan
    </h1>
    <div className="flex justify-center mb-10">

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-1 flex">

    <button
      onClick={() => setBilling("monthly")}
      className={`px-6 py-2 rounded-xl ${
        billing === "monthly"
          ? "bg-white text-black"
          : "text-white"
      }`}
    >
      Monthly
    </button>

    <button
      onClick={() => setBilling("yearly")}
      className={`px-6 py-2 rounded-xl ${
        billing === "yearly"
          ? "bg-green-600"
          : "text-white"
      }`}
    >
      Yearly (Save 20%)
    </button>

  </div>

</div>

    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Starter
        </h2>
<p className="text-4xl font-bold mb-2">
  {billing === "monthly"
    ? "₹49"
    : "₹399"}
</p>

<p className="text-zinc-400">
  {billing === "monthly"
    ? "/month"
    : "/year"}
</p>

        <p className="mb-4">
          5,000 Credits
        </p>

        <ul className="space-y-2 text-zinc-400">
          <li>✓ Fast TTS</li>
          <li>✓ 4 Voices</li>
          <li>✓ Download Audio</li>
        </ul>
<button
  onClick={() => {
    setSelectedPlan("Starter");
    setActivePage("payments");
  }}
  className="w-full mt-8 bg-white text-black py-3 rounded-2xl font-semibold"
>
  Buy Now
</button>
      </div>

      <div className="bg-zinc-900 border-2 border-green-500 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Pro
        </h2>
<p className="text-4xl font-bold mb-2">
  {billing === "monthly"
    ? "₹149"
    : "₹1440"}
</p>

<p className="text-zinc-400">
  {billing === "monthly"
    ? "/month"
    : "/year"}
</p>

        <p className="mb-4">
          20,000 Credits
        </p>

        <ul className="space-y-2 text-zinc-400">
          <li>✓ Everything in Starter</li>
          <li>✓ Priority Speed</li>
          <li>✓ Best Value</li>
        </ul>
<button
  onClick={() => {
    setSelectedPlan("Pro");
    setActivePage("payments");
  }}
  className="w-full mt-8 bg-white text-black py-3 rounded-2xl font-semibold"
>
  Buy Now
</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-4">
          Creator
        </h2>

        <p className="text-4xl font-bold mb-2">
  {billing === "monthly"
    ? "₹499"
    : "₹4790"}
</p>

<p className="text-zinc-400">
  {billing === "monthly"
    ? "/month"
    : "/year"}
</p>

        <p className="mb-4">
          100,000 Credits
        </p>

        <ul className="space-y-2 text-zinc-400">
          <li>✓ Everything in Pro</li>
          <li>✓ Huge Credits</li>
          <li>✓ Content Creators</li>
        </ul>
<button
  onClick={() => {
    setSelectedPlan("Creator");
    setActivePage("payments");
  }}
  className="w-full mt-8 bg-white text-black py-3 rounded-2xl font-semibold"
>
  Buy Now
</button>
      </div>

    </div>

  </div>
)}

{activePage === "payments" && (
  <div className="w-full max-w-3xl">

    <h1 className="text-5xl font-bold mb-8">
      Payment
    </h1>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <p className="text-xl mb-4">
        Selected Plan:
      </p>

      <h2 className="text-3xl font-bold mb-6">
        {selectedPlan || "No Plan Selected"}
      </h2>

      {selectedPlan === "Starter" && (
        <p className="text-zinc-400 mb-6">
          5,000 Credits • ₹49/month
        </p>
      )}

      {selectedPlan === "Pro" && (
        <p className="text-zinc-400 mb-6">
          20,000 Credits • ₹149/month
        </p>
      )}

      {selectedPlan === "Creator" && (
        <p className="text-zinc-400 mb-6">
          100,000 Credits • ₹499/month
        </p>
      )}

      <button
        className="w-full bg-green-600 py-4 rounded-2xl font-semibold"
      >
        Proceed To Payment
      </button>

    </div>

  </div>
)}

{activePage === "about" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      About Us
    </h1>
<p className="text-zinc-400 mb-8">
  Learn more about AI Voice App and our mission.
</p>
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <h2 className="text-2xl font-bold mb-4">
        AI Voice App
      </h2>

      <p className="text-zinc-300 leading-8">
        AI Voice App is a simple and affordable AI
        text-to-speech platform designed for students,
        creators, businesses and content makers.
      </p>

      <p className="text-zinc-300 leading-8 mt-4">
        Our mission is to provide high-quality AI voices
        at affordable pricing with an easy-to-use
        experience.
      </p>

      <p className="text-zinc-300 leading-8 mt-4">
        Users can convert text into natural sounding
        speech, download audio files and use them for
        videos, learning, presentations and content
        creation.
      </p>

      <div className="mt-8 border-t border-zinc-700 pt-6">

        <p className="text-zinc-400">
          Contact:
        </p>

        <p className="font-semibold text-green-400">
  aivoice.support@gmail.com
</p>

      </div>

    </div>

  </div>
)}


{activePage === "contact" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      Contact Us
    </h1>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <p className="text-zinc-300 mb-6">
        Need help? We're here to assist you.
      </p>

      <div className="space-y-4">

        <div>
          <p className="text-zinc-400">
            Support Email
          </p>
          <p className="font-semibold text-green-400">
            aivoice.support@gmail.com
          </p>
        </div>

        <div>
          <p className="text-zinc-400">
            Support Hours
          </p>
          <p>
            Monday - Saturday
          </p>
        </div>

        <div>
          <p className="text-zinc-400">
            Response Time
          </p>
          <p>
            Within 24-48 Hours
          </p>
        </div>

      </div>

    </div>

  </div>
)}



{activePage === "privacy" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      Privacy Policy
    </h1>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <p className="text-zinc-300 mb-4">
        AI Voice App values your privacy and is committed
        to protecting your personal information.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Information We Collect
      </h2>

      <p className="text-zinc-300">
        We may collect your name, email address,
        login information and usage data to provide
        our services.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        How We Use Information
      </h2>

      <p className="text-zinc-300">
        We use collected information to provide,
        improve and maintain our services.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Data Security
      </h2>

      <p className="text-zinc-300">
        We take reasonable measures to protect
        your information from unauthorized access.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Contact
      </h2>

      <p className="text-green-400 font-semibold">
        aivoice.support@gmail.com
      </p>

    </div>

  </div>
)}


{activePage === "terms" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      Terms & Conditions
    </h1>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <p className="text-zinc-300 mb-4">
        By using AI Voice App, you agree to these Terms
        and Conditions.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Service Usage
      </h2>

      <p className="text-zinc-300">
        Users may use AI Voice App only for lawful
        purposes and in accordance with applicable laws.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        User Accounts
      </h2>

      <p className="text-zinc-300">
        Users are responsible for maintaining the
        security of their accounts and login credentials.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Credits & Plans
      </h2>

      <p className="text-zinc-300">
        Credits are deducted based on text usage.
        Purchased plans provide access to additional
        credits according to the selected subscription.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Limitation of Liability
      </h2>

      <p className="text-zinc-300">
        AI Voice App shall not be liable for any indirect,
        incidental or consequential damages arising from
        the use of the service.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Contact
      </h2>

      <p className="font-semibold text-green-400">
        aivoice.support@gmail.com
      </p>

    </div>

  </div>
)}


{activePage === "refund" && (
  <div className="w-full max-w-4xl">

    <h1 className="text-5xl font-bold mb-8">
      Refund Policy
    </h1>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

      <p className="text-zinc-300 mb-4">
        At AI Voice App, customer satisfaction is important
        to us. Please read our refund policy carefully.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Digital Services
      </h2>

      <p className="text-zinc-300">
        Since AI Voice App provides digital services and
        credits are consumed immediately after use,
        refunds are generally not provided for used credits.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Duplicate Payments
      </h2>

      <p className="text-zinc-300">
        If you are charged multiple times for the same
        transaction, please contact us and we will review
        the payment.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Technical Issues
      </h2>

      <p className="text-zinc-300">
        If a payment is successful but credits are not
        added to your account due to a technical issue,
        we will investigate and resolve the issue.
      </p>

      <h2 className="text-xl font-bold mt-6 mb-2">
        Contact
      </h2>

      <p className="font-semibold text-green-400">
        aivoice.support@gmail.com
      </p>

    </div>

  </div>
)}



   {activePage === "home" && (
<>
  <h1 className="text-6xl font-bold mb-4 text-center">
    AI Voice Generator
  </h1>
      {user && (
        <p className="text-zinc-400 mt-4 mb-6">
          Welcome, {user.displayName}
        </p>
      )}

      <p className="text-zinc-400 text-center mb-10 max-w-xl">
        Convert text into realistic AI speech instantly.
      </p>

      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className="w-full mb-4 bg-black border border-zinc-700 rounded-2xl p-4 text-white"
        >

          <option value="alloy">Alloy Voice</option>
          <option value="echo">Echo Voice</option>
          <option value="nova">Nova Voice</option>
          <option value="shimmer">Shimmer Voice</option>

        </select>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your text here..."
          className="w-full h-56 bg-black border border-zinc-700 rounded-2xl p-5 outline-none resize-none text-lg"
        />

        <div className="flex justify-between text-sm text-zinc-400 mt-2">

          <p>
            Characters: {text.length}
          </p>

          <p>
            Credits Left: {credits}
          </p>

        </div>

        <button
          onClick={generateAudio}
          className="w-full mt-6 bg-white text-black py-4 rounded-2xl font-semibold text-lg"
        >
          {loading ? "Generating..." : "Generate Audio"}
        </button>

        {audioUrl && (
          <audio
            controls
            className="w-full mt-6"
            src={audioUrl}
          />
        )}

        {audioUrl && (
  <a
    href={audioUrl}
    download="ai-voice.mp3"
    className="block w-full mt-4 bg-green-600 text-white text-center py-4 rounded-2xl font-semibold"
  >
    Download Audio
  </a>
)}

      </div>
      </>
)}

    </main>
  );
}