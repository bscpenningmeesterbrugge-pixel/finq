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
  const [selectedRole, setSelectedRole] = useState("student");
const [assignments, setAssignments] = useState([]);
const [activePage, setActivePage] = useState("dashboard");
  const [role, setRole] = useState("student");
  const [newAssignment, setNewAssignment] = useState("");
  

const [messages, setMessages] = useState([]);
   const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
const [selectedStudent, setSelectedStudent] = useState("");
const [studentName, setStudentName] = useState("");
const [subject, setSubject] = useState("");
const [score, setScore] = useState("");
const [newMessageTitle, setNewMessageTitle] = useState("");
const [newMessageContent, setNewMessageContent] = useState("");
  const [submissionText, setSubmissionText] = useState("");
const [submissions, setSubmissions] = useState([]);



useEffect(() => {
checkUser();
}, []);

async function checkUser() {
  const { data } =
    await supabase.auth.getUser();

  const currentUser = data?.user;

  setUser(currentUser);

  if (!currentUser) return;

  // profiel ophalen
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  const userRole =
    profile?.role || "student";

  setRole(userRole);

  loadMessages();
  loadGrades();
  loadStudents();

  loadAssignments(
    currentUser.id,
    userRole
  );
}

async function loadStudents() {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student");

  setStudents(data || []);
}


  
async function loadAssignments(
  userId,
  userRole
) {
  let query = supabase
    .from("assignments")
    .select("*");

  // student ziet enkel eigen opdrachten
  if (userRole === "student") {
    query = query.eq(
      "student_id",
      userId
    );
  }

  const { data, error } = await query;

  if (error) {
    console.log(error);
    return;
  }

  setAssignments(data || []);
}

async function loadSubmissions() {
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  setSubmissions(data || []);
}



  
  async function loadMessages() {
const { data } = await supabase
.from("messages")
.select("*")
.order("created_at", { ascending: false });

setMessages(data || []);
}

  async function loadGrades() {
  const { data } = await supabase
    .from("grades")
    .select("*")
    .order("created_at", { ascending: false });

  setGrades(data || []);
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
if (data?.user) {
  loadAssignments();
  loadMessages();
  loadGrades();
   loadStudents();
  loadSubmissions();
}

}

  async function signup() {
  const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
     role: selectedRole,
    },
  },
});

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          role: selectedRole,
        },
      ]);
  }

  alert("Account aangemaakt!");
    checkUser();
}

async function addAssignment() {
  if (!newAssignment || !selectedStudent) return;

  const { error } = await supabase
    .from("assignments")
    .insert([
      {
        title: newAssignment,
        student_id: selectedStudent,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  setNewAssignment("");
  setSelectedStudent("");

  loadAssignments();
}
  <select
  value={selectedStudent}
  onChange={(e) =>
    setSelectedStudent(e.target.value)
  }
  style={{
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  }}
>
  <option value="">
    Kies student
  </option>

  {students.map((s) => (
    <option
      key={s.id}
      value={s.id}
    >
      {s.email}
    </option>
  ))}
</select>

async function submitAssignment(
  assignmentId
) {
  if (!submissionText) return;

  const { error } = await supabase
    .from("submissions")
    .insert([
      {
        assignment_id: assignmentId,
        student_id: user.id,
        content: submissionText,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  setSubmissionText("");

  loadSubmissions();

  alert("Assignment ingediend!");
}

  
async function addMessage() {
if (!newMessageTitle) return;

const { error } = await supabase
.from("messages")
.insert([
{
title: newMessageTitle,
content: newMessageContent,
},
]);

if (error) {
alert(error.message);
return;
}

setNewMessageTitle("");
setNewMessageContent("");

loadMessages();
}

  async function addGrade() {
  if (!studentName || !subject || !score) return;

  const { error } = await supabase
    .from("grades")
    .insert([
      {
        student: studentName,
        subject,
        score,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  setStudentName("");
  setSubject("");
  setScore("");

  loadGrades();
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

<div
  style={{
    marginBottom: 20,
  }}
>
  <p
    style={{
      marginBottom: 10,
      fontWeight: "bold",
      color: "#0f172a",
    }}
  >
    Account type
  </p>

  <div
    style={{
      background: "#e2e8f0",
      borderRadius: 999,
      padding: 4,
      display: "flex",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 4,
        left:
          selectedRole === "student"
            ? 4
            : "50%",
        width: "calc(50% - 4px)",
        height: "calc(100% - 8px)",
        background: "#0f766e",
        borderRadius: 999,
        transition: "all 0.25s ease",
      }}
    />

    <button
      onClick={() =>
        setSelectedRole("student")
      }
      style={{
        flex: 1,
        padding: 10,
        border: "none",
        background: "transparent",
        color:
          selectedRole === "student"
            ? "white"
            : "#0f172a",
        fontWeight: "bold",
        zIndex: 2,
        cursor: "pointer",
      }}
    >
      Student
    </button>

    <button
      onClick={() =>
        setSelectedRole("teacher")
      }
      style={{
        flex: 1,
        padding: 10,
        border: "none",
        background: "transparent",
        color:
          selectedRole === "teacher"
            ? "white"
            : "#0f172a",
        fontWeight: "bold",
        zIndex: 2,
        cursor: "pointer",
      }}
    >
      Teacher
    </button>
  </div>
</div>

  
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

  <button
  onClick={signup}
  style={{
    width: "100%",
    padding: 10,
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: 8,
    marginTop: 10,
  }}
>
  Account aanmaken
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

<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

<button
style={menuButton}
onClick={() => setActivePage("dashboard")}

>


Dashboard


  </button>

<button
style={menuButton}
onClick={() => setActivePage("assignments")}

>


Assignments


  </button>

<button
style={menuButton}
onClick={() => setActivePage("inbox")}

>


Inbox


  </button>

<button
style={menuButton}
onClick={() => setActivePage("grades")}

>


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
    <div>
  <h1 style={{ color: "#0f172a", margin: 0 }}>
    {role === "teacher"
  ? "Teacher Dashboard"
  : "Student Dashboard"}
  </h1>

  <div
  style={{
    display: "inline-block",
    background:
      role === "teacher"
        ? "#dcfce7"
        : "#dbeafe",
    color:
      role === "teacher"
        ? "#166534"
        : "#1d4ed8",
    padding: "6px 14px",
    borderRadius: 999,
    fontWeight: "bold",
    marginTop: 8,
  }}
>
  {role === "teacher"
    ? "👨‍🏫 Teacher"
    : "🎓 Student"}
</div>
</div>

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
       <p style={bigNumber}>
  {messages.length}
</p>
      </div>

      <div style={cardStyle}>
        <h3>Notifications</h3>
       <p style={bigNumber}>
  {assignments.length + messages.length}
</p>
      </div>
    </div>

    {/* ASSIGNMENTS */}
    {activePage === "dashboard" && (

  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 24,
    }}
  >
    <h2>Welkom terug 👋</h2>


<p>
  Je bent ingelogd op Ultimate Smartschool.
</p>


  </div>
)}

{activePage === "assignments" && (

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
   


{role === "teacher" && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 20,
    }}
  >
    <input
      value={newAssignment}
      onChange={(e) =>
        setNewAssignment(e.target.value)
      }
      placeholder="Nieuwe opdracht..."
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ddd",
      }}
    />

    <select
      value={selectedStudent}
      onChange={(e) =>
        setSelectedStudent(e.target.value)
      }
      style={{
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ddd",
      }}
    >
      <option value="">
        Kies student
      </option>

      {students.map((s) => (
        <option
          key={s.id}
          value={s.id}
        >
          {s.email}
        </option>
      ))}
    </select>

    <button
      onClick={addAssignment}
      style={{
        background: "#0f766e",
        color: "white",
        border: "none",
        padding: "12px 18px",
        borderRadius: 10,
        cursor: "pointer",
      }}
    >
      Assignment toewijzen
    </button>
  </div>
)}

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

    {role === "student" && (
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <textarea
          placeholder="Typ je antwoord..."
          value={submissionText}
          onChange={(e) =>
            setSubmissionText(e.target.value)
          }
          rows={4}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <button
          onClick={() =>
            submitAssignment(a.id)
          }
          style={{
            background: "#0f766e",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Assignment indienen
        </button>
      </div>
    )}
  </div>
))}
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
)}

{activePage === "inbox" && (

  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 24,
    }}
  >
    <h2 style={{ marginBottom: 20 }}>
      Inbox
    </h2>

    {role === "teacher" && (

<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  }}
>
  <input
    value={newMessageTitle}
    onChange={(e) =>
      setNewMessageTitle(e.target.value)
    }
    placeholder="Titel"
    style={{
      padding: 12,
      borderRadius: 10,
      border: "1px solid #ddd",
    }}
  />

  <textarea
    value={newMessageContent}
    onChange={(e) =>
      setNewMessageContent(e.target.value)
    }
    placeholder="Bericht..."
    rows={4}
    style={{
      padding: 12,
      borderRadius: 10,
      border: "1px solid #ddd",
    }}
  />

  {role === "teacher" && (
  <button
    onClick={addMessage}
    style={{
      background: "#0f766e",
      color: "white",
      border: "none",
      padding: "12px 18px",
      borderRadius: 10,
      cursor: "pointer",
    }}
  >
    Bericht posten
  </button>
)}
    
</div>

    )}
    
{messages.map((m) => (
  <div
    key={m.id}
    style={{
      padding: 18,
      borderRadius: 14,
      background: "#f8fafc",
      marginBottom: 14,
      border: "1px solid #ddd",
    }}
  >
    <h3>{m.title}</h3>

    <p>{m.content}</p>
  </div>
))}

  </div>
)}
    {activePage === "grades" && (

  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 24,
    }}
  >
    <h2 style={{ marginBottom: 20 }}>
      Puntenmodule
    </h2>

    {role === "teacher" && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 24,
    }}
  >
      <input
        placeholder="Student"
        value={studentName}
        onChange={(e) =>
          setStudentName(e.target.value)
        }
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      />

      <input
        placeholder="Vak"
        value={subject}
        onChange={(e) =>
          setSubject(e.target.value)
        }
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      />

      <input
        placeholder="Score"
        type="number"
        value={score}
        onChange={(e) =>
          setScore(e.target.value)
        }
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      />

      <button
        onClick={addGrade}
        style={{
          background: "#0f766e",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Punt toevoegen
      </button>
    </div>
)}
    {grades.map((g) => (
      <div
        key={g.id}
        style={{
          padding: 18,
          borderRadius: 14,
          background: "#f8fafc",
          marginBottom: 14,
          border: "1px solid #ddd",
        }}
      >
        <h3>{g.student}</h3>

        <p>Vak: {g.subject}</p>

        <p>Score: {g.score}/20</p>
      </div>
    ))}
  </div>
)}

  </div>
</main>

</div>
);
}
  
