import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);

const menuButton = {
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "none",
  padding: 14,
  borderRadius: 12,
  textAlign: "left",
  cursor: "pointer",
};

const cardStyle = {
  background: "white",
  borderRadius: 20,
  padding: 24,
};

const bigNumber = {
  fontSize: 36,
  fontWeight: "bold",
  color: "#0f766e",
};

export default function App() {
  console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

const [user, setUser] = useState(null);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [assignments, setAssignments] = useState([]);

useEffect(() => {
checkUser();
}, []);

async function checkUser() {
const { data } = await supabase.auth.getUser();


setUser(data?.user || null);

if (data?.user) {
  loadAssignments();
}


}

async function loadAssignments() {
const { data } = await supabase
.from("assignments")
.select("*");


setAssignments(data || []);


}

async function login() {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
});


if (error) {
  alert(error.message);
  return;
}

checkUser();


}

async function logout() {
await supabase.auth.signOut();
setUser(null);
}

if (!user) {
return (
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "#f1f5f9",
}}
>
<div
style={{
background: "white",
padding: 30,
borderRadius: 12,
width: 320,
}}
> <h1>Ultimate Smartschool</h1>


      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
        }}
      />

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: 10,
          background: "#0f172a",
          color: "white",
          border: "none",
          borderRadius: 8,
        }}
      >
        Login
      </button>
    </div>
  </div>
);


}

return (
<div style={{ padding: 40 }}> <h1>Dashboard</h1>


  <button onClick={logout}>
    Logout
  </button>

  <h2>Assignments</h2>

  {assignments.map((a) => (
    <div
      key={a.id}
      style={{
        padding: 10,
        marginBottom: 10,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      {a.title}
    </div>
  ))}
</div>


);
}
