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

  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      background: "#f1f5f9",
      fontFamily: "Arial",
    }}
  >
    {/* SIDEBAR */}
    <aside
      style={{
        width: 260,
        background: "linear-gradient(180deg,#0f172a,#134e4a)",
        color: "white",
        padding: 24,
      }}
    >
      <h2 style={{ marginBottom: 40 }}>
        Ultimate Smartschool
      </h2>

```
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <button style={menuButton}>
      Dashboard
    </button>

    <button style={menuButton}>
      Assignments
    </button>

    <button style={menuButton}>
      Inbox
    </button>

    <button style={menuButton}>
      Grades
    </button>
  </div>
</aside>

{/* MAIN */}
<main style={{ flex: 1 }}>
  {/* TOPBAR */}
  <div
    style={{
      height: 80,
      background: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: 30,
      paddingRight: 30,
      borderBottom: "1px solid #ddd",
    }}
  >
    <h1 style={{ color: "#0f172a" }}>
      Dashboard
    </h1>

    <button
      onClick={logout}
      style={{
        background: "#0f172a",
        color: "white",
        border: "none",
        padding: "10px 18px",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  </div>

  {/* CONTENT */}
  <div style={{ padding: 30 }}>
    {/* STATS */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: 20,
        marginBottom: 30,
      }}
    >
      <div style={cardStyle}>
        <h3>Assignments</h3>
        <p style={bigNumber}>
          {assignments.length}
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Messages</h3>
        <p style={bigNumber}>12</p>
      </div>

      <div style={cardStyle}>
        <h3>Notifications</h3>
        <p style={bigNumber}>5</p>
      </div>
    </div>

    {/* ASSIGNMENTS */}
    <div
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>
        Recent Assignments
      </h2>

      {assignments.map((a) => (
        <div
          key={a.id}
          style={{
            padding: 18,
            borderRadius: 14,
            background: "#ecfeff",
            marginBottom: 12,
            border: "1px solid #a5f3fc",
          }}
        >
          <strong>{a.title}</strong>
        </div>
      ))}
    </div>
  </div>
</main>
```

  </div>
);

}
