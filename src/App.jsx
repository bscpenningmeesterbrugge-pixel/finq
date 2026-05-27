import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);

const menuButton = {
  background: "#1e293b",
  color: "white",
  border: "none",
  padding: 16,
  borderRadius: 14,
  textAlign: "left",
  cursor: "pointer",
  fontSize: 16,
};

const inputStyle = {
  padding: 14,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 15,
  outline: "none",
};

const cardStyle = {
  background: "white",
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const bigNumber = {
  fontSize: 42,
  fontWeight: "bold",
  color: "#2563eb",
};

export default function App() {
  console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

  const [loading, setLoading] = useState(false);
const [user, setUser] = useState(null);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
const [assignments, setAssignments] = useState([]);
  const [assignmentDescription, setAssignmentDescription] = useState("");
const [assignmentDeadline, setAssignmentDeadline] = useState("");
const [activePage, setActivePage] = useState("dashboard");
  const [role, setRole] = useState("student");
  const [newAssignment, setNewAssignment] = useState("");
  const [answers, setAnswers] = useState({});
  

const [messages, setMessages] = useState([]);
   const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
const [selectedStudent, setSelectedStudent] = useState("");
const [studentName, setStudentName] = useState("");
const [subject, setSubject] = useState("");
const [score, setScore] = useState("");
const [newMessageTitle, setNewMessageTitle] = useState("");
const [newMessageContent, setNewMessageContent] = useState("");
  const [submissionTexts, setSubmissionTexts] = useState({});
  const [submissions, setSubmissions] = useState([]);
    const [reviewData, setReviewData] = useState({});
  const filteredSubmissions =
  role === "teacher"
    ? submissions
    : submissions.filter(
        (s) => s.student_id === user?.id
      );

  const submitQuiz = (assignmentId, questionsCount) => {
  const result = Array.from({ length: questionsCount }).map((_, qi) => ({
    questionKey: `${assignmentId}-${qi}`,
    answer: answers[`${assignmentId}-${qi}`] || null,
  }));

  console.log("QUIZ RESULT:", result);
};
const submittedAssignmentIds =
  submissions
    .filter(
      (s) => s.student_id === user?.id
    )
    .map(
      (s) => s.assignment_id
    );
  

useEffect(() => {
  checkUser();

  const channel = supabase
    .channel("messages-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        loadMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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
loadSubmissions();
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
  const { data, error } = await supabase
    .from("submissions")
    .select(`
  *,
  profiles:student_id (
    email
  ),
  assignments:assignment_id (
    title
  )
`)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(error);
    return;
  }

  setSubmissions(data || []);
}

  async function reviewSubmission(
  submissionId
) {
  const currentReview =
    reviewData[submissionId];

  if (!currentReview) return;

  const { error } = await supabase
    .from("submissions")
    .update({
      grade: currentReview.grade,
      feedback: currentReview.feedback,
    })
    .eq("id", submissionId);

  if (error) {
    alert(error.message);
    return;
  }

  loadSubmissions();

  alert("Verbetering opgeslagen!");
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
  setLoading(true);

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  setLoading(false);

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user) {
    checkUser();
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

if (data.user) {
  checkUser();
}
}

async function addAssignment() {
  if (!newAssignment || !selectedStudent) return;

  try {
    const aiResponse = await fetch("/api/generate-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: newAssignment }),
    });

    const aiData = await aiResponse.json();

    console.log("AI STATUS:", aiResponse.status);
    console.log("AI DATA:", aiData);

    if (!aiResponse.ok) {
      alert(aiData.error || "AI fout");
      return;
    }

    const { error } = await supabase.from("assignments").insert([
      {
        title: newAssignment,
        description: assignmentDescription,
        deadline: assignmentDeadline,
        student_id: selectedStudent,

        // ✅ HIER KOMT JE AI DATA (BELANGRIJK)
      generated_questions: aiData.result.questions || [],
        status: "open",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewAssignment("");
    setAssignmentDescription("");
    setAssignmentDeadline("");
    setSelectedStudent("");

    loadAssignments(user.id, role);

    alert("AI assignment gemaakt!");
  } catch (err) {
    console.log(err);
    alert("AI generatie mislukt");
  }
}
  
async function submitAssignment(
  assignmentId
) {
  const content =
    submissionTexts[assignmentId];

  if (!content) return;

  // submission opslaan
  const { error } = await supabase
    .from("submissions")
    .insert([
      {
        assignment_id: assignmentId,
        student_id: user.id,
        content: content,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  // assignment status aanpassen
  const { error: updateError } =
    await supabase
      .from("assignments")
      .update({
        status: "ingediend",
      })
      .eq("id", assignmentId);

  if (updateError) {
    alert(updateError.message);
    return;
  }

  // textarea leegmaken
  setSubmissionTexts({
    ...submissionTexts,
    [assignmentId]: "",
  });

  // alles opnieuw laden
  loadAssignments(user.id, role);
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
  if (!studentName || !subject || !score)
    return;

  const { error } = await supabase
    .from("grades")
    .insert([
      {
        student: studentName,
        subject: subject,
        score: score,
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

  alert("Punt toegevoegd!");
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
       background: "#2563eb",
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
        {loading ? "Bezig..." : "Login"}
      </button>

  <button
  onClick={signup}
  style={{
    width: "100%",
    padding: 10,
   background: "#2563eb",
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
       background: "linear-gradient(180deg,#0f172a,#1e293b)",
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

<button
  style={menuButton}
  onClick={() =>
    setActivePage("submissions")
  }
>
  Submissions
</button>

  <button
  style={menuButton}
  onClick={() =>
    setActivePage("archive")
  }
>
  Archief
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
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30,
  }}
>
 <div style={cardStyle}>
  <h3>Open opdrachten</h3>

  <p style={bigNumber}>
    {
      assignments.filter(
        (a) => a.status !== "ingediend"
      ).length
    }
  </p>
</div>

<div style={cardStyle}>
  <h3>Ingediend</h3>

  <p style={bigNumber}>
    {
      assignments.filter(
        (a) => a.status === "ingediend"
      ).length
    }
  </p>
</div>

<div style={cardStyle}>
  <h3>Totaal opdrachten</h3>

  <p style={bigNumber}>
    {assignments.length}
  </p>
</div>
  
</div>   
    {/* ASSIGNMENTS */}
{assignments
  .filter((a) => {
    if (role === "teacher") return true;
    return a.status !== "ingediend";
  })
  .sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  )
  .map((a) => (
    <div
      key={a.id}
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        border: "1px solid #e2e8f0",
      }}
    >
      <h3>{a.title}</h3>

      <p>{a.description}</p>

      {/* QUESTIONS */}
      {Array.isArray(a.generated_questions) &&
        a.generated_questions.map((q, qi) => {
          if (!q || !Array.isArray(q.options))
            return null;

          return (
            <div
              key={qi}
              style={{ marginBottom: 16 }}
            >
              <p
                style={{
                  fontWeight: "bold",
                }}
              >
                {q.question}
              </p>

              {q.options.map((o, oi) => (
                <label
                  key={oi}
                  style={{
                    display: "block",
                    marginTop: 6,
                  }}
                >
                  <input
                    type="radio"
                    name={`q-${a.id}-${qi}`}
                    value={o}
                    checked={
                      answers[
                        `${a.id}-${qi}`
                      ] === o
                    }
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        [`${a.id}-${qi}`]: o,
                      })
                    }
                  />

                  {o}
                </label>
              ))}
            </div>
          );
        })}

      <button
        onClick={() =>
          submitAssignment(a.id)
        }
      >
        Assignment indienen
      </button>
    </div>
        })}

    {/* ASSIGNMENTS */}
    console.log(assignments);
    
{assignments
  .filter((a) => {
    if (role === "teacher") return true;
    return a.status !== "ingediend";
  })
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .map((a) => (
    <div
      key={a.id}
      style={{
        background: "white",
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* TITLE */}
      <h3 style={{ marginBottom: 10 }}>{a.title}</h3>

      {/* DESCRIPTION */}
      <p style={{ marginBottom: 14, color: "#475569" }}>
        {a.description}
      </p>

      {/* QUIZ */}
      <button
        onClick={() =>
          submitQuiz(a.id, a.generated_questions?.length || 0)
        }
        style={{
          marginBottom: 16,
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          background: "#0f172a",
          color: "white",
          cursor: "pointer",
        }}
      >
        Quiz indienen
      </button>

     {/* QUESTIONS */}
{Array.isArray(a.generated_questions) &&
  a.generated_questions.map((q, qi) => {
    if (!q || !Array.isArray(q.options)) return null;

    return (
      <div key={qi} style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: "bold" }}>
          {q.question}
        </p>

        {q.options.map((o, oi) => (
          <label
            key={oi}
            style={{
              display: "block",
              marginTop: 6,
            }}
          >
            <input
              type="radio"
              name={`q-${a.id}-${qi}`}
              value={o}
              checked={
                answers[`${a.id}-${qi}`] === o
              }
              onChange={() =>
                setAnswers({
                  ...answers,
                  [`${a.id}-${qi}`]: o,
                })
              }
              style={{ marginRight: 8 }}
            />
            {o}
          </label>
        ))}
      </div>
    );
  })}
    
       {/* SUBMISSIONS */}
    {role === "teacher" && (
      <div style={{ marginTop: 40 }}>
        <h2>Ingediende assignments</h2>

       {filteredSubmissions.map((s) => (
          <div
            key={s.id}
            style={{
              background: "#f8fafc",
              padding: 20,
              borderRadius: 18,
              marginTop: 16,
              border: "1px solid #e2e8f0",
            }}
          >
           <p>
  <strong>Student:</strong>{" "}
  {s.profiles?.email}
</p>

           <div>
  <strong>Antwoord:</strong>

  <div
    style={{
      marginTop: 10,
      background: "white",
      padding: 14,
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      lineHeight: 1.6,
    }}
  >
    {s.content}
  </div>
</div>

            
          </div>
        ))}
      </div>
    )}
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

        <button
          onClick={addMessage}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Bericht posten
        </button>
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

{activePage === "archive" && (
  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 24,
    }}
  >
    <h2 style={{ marginBottom: 20 }}>
      Archief
    </h2>

    {assignments
      .filter(
        (a) => a.status === "ingediend"
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )
      .map((a) => (
        <div
          key={a.id}
          style={{
            padding: 18,
            borderRadius: 14,
            background: "#f8fafc",
            marginBottom: 14,
            border: "1px solid #ddd",
          }}
        >
          <h3>{a.title}</h3>

          <p>{a.description}</p>

          <div
            style={{
              marginTop: 10,
              background: "#dcfce7",
              color: "#166534",
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              fontWeight: "bold",
            }}
          >
            ✅ Ingediend
          </div>
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
            background: "#2563eb",
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
    
{activePage === "submissions" && (
  <div
    style={{
      background: "white",
      borderRadius: 20,
      padding: 24,
    }}
  >
    <h2 style={{ marginBottom: 20 }}>
      Ingediende opdrachten
    </h2>

    {filteredSubmissions.map((s) => (
      <div
        key={s.id}
        style={{
          padding: 18,
          borderRadius: 14,
          background: "#f8fafc",
          marginBottom: 16,
          border: "1px solid #ddd",
        }}
      >
       <p>
  <strong>Student:</strong>{" "}
  {s.profiles?.email}
</p>

        <p>
          <strong>Assignment:</strong>{" "}
         {s.assignments?.title}
        </p>

        <p>
          <strong>Antwoord:</strong>
        </p>

        <div
          style={{
            background: "white",
            padding: 12,
            borderRadius: 10,
            marginTop: 8,
            marginBottom: 14,
          }}
        >
          {s.content}
        </div>

        {role === "teacher" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
           <input
  placeholder="Score /20"
  type="number"
  value={reviewData[s.id]?.grade || ""}
  onChange={(e) =>
    setReviewData({
      ...reviewData,
      [s.id]: {
        ...reviewData[s.id],
        grade: e.target.value,
      },
    })
  }
  style={{
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  }}
/>

<textarea
  placeholder="Feedback..."
  value={reviewData[s.id]?.feedback || ""}
  onChange={(e) =>
    setReviewData({
      ...reviewData,
      [s.id]: {
        ...reviewData[s.id],
        feedback: e.target.value,
      },
    })
  }
  rows={3}
  style={{
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
  }}
/>

<button
  onClick={() =>
    reviewSubmission(s.id)
  }
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
  }}
>
  Verbeteren
</button>
          </div>
        )}

        {s.grade !== null && (
          <div
            style={{
              marginTop: 14,
              background: "#dcfce7",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <strong>Score:</strong>{" "}
            {s.grade}/20

            <br />

            <strong>Feedback:</strong>{" "}
            {s.feedback}
          </div>
        )}
      </div>
    ))}
  </div>
)}
  
    </div>
  </main>
</div>
);
}
  
