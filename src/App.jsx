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
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [selectedRole, setSelectedRole] = useState("student");
  const [role, setRole] = useState("student");

  const [activePage, setActivePage] = useState("dashboard");

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);

  const [messages, setMessages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [newAssignment, setNewAssignment] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [submissionTexts, setSubmissionTexts] = useState({});
  const [answers, setAnswers] = useState({});

  const [newMessageTitle, setNewMessageTitle] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");

  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");

  const [reviewData, setReviewData] = useState({});

  const filteredSubmissions =
    role === "teacher"
      ? submissions
      : submissions.filter((s) => s.student_id === user?.id);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    const currentUser = data?.user;

    setUser(currentUser);
    if (!currentUser) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();

    const userRole = profile?.role || "student";
    setRole(userRole);

    loadAssignments(currentUser.id, userRole);
    loadMessages();
    loadGrades();
    loadStudents();
    loadSubmissions();
  }

  async function loadStudents() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student");

    setStudents(data || []);
  }

  async function loadAssignments(userId, userRole) {
    let query = supabase.from("assignments").select("*");

    if (userRole === "student") {
      query = query.eq("student_id", userId);
    }

    const { data } = await query;
    setAssignments(data || []);
  }

  async function loadSubmissions() {
    const { data } = await supabase
      .from("submissions")
      .select(`
        *,
        profiles:student_id(email),
        assignments:assignment_id(title)
      `)
      .order("created_at", { ascending: false });

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
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return alert(error.message);

    checkUser();
  }

  async function signup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: selectedRole },
      },
    });

    if (error) return alert(error.message);

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email,
          role: selectedRole,
        },
      ]);
    }

    checkUser();
  }

  async function addAssignment() {
    const res = await fetch("/api/generate-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: newAssignment }),
    });

    const aiData = await res.json();

    await supabase.from("assignments").insert([
      {
        title: newAssignment,
        description: assignmentDescription,
        deadline: assignmentDeadline,
        student_id: selectedStudent,
        generated_questions: aiData?.result?.questions ?? [],
        status: "open",
      },
    ]);

    loadAssignments(user.id, role);
  }

  async function submitAssignment(assignmentId) {
    const content = submissionTexts[assignmentId];
    if (!content) return;

    const assignmentAnswers = Object.fromEntries(
      Object.entries(answers).filter(([key]) =>
        key.startsWith(`${assignmentId}-`)
      )
    );

    await supabase.from("submissions").insert([
      {
        assignment_id: assignmentId,
        student_id: user.id,
        content,
        quiz_answers: assignmentAnswers,
      },
    ]);

    await supabase
      .from("assignments")
      .update({ status: "ingediend" })
      .eq("id", assignmentId);

    setSubmissionTexts({ ...submissionTexts, [assignmentId]: "" });

    loadAssignments(user.id, role);
    loadSubmissions();
  }

  async function addMessage() {
    await supabase.from("messages").insert([
      {
        title: newMessageTitle,
        content: newMessageContent,
      },
    ]);

    setNewMessageTitle("");
    setNewMessageContent("");
    loadMessages();
  }

  async function addGrade() {
    await supabase.from("grades").insert([
      {
        student: studentName,
        subject,
        score,
      },
    ]);

    setStudentName("");
    setSubject("");
    setScore("");
    loadGrades();
  }

  async function reviewSubmission(id) {
    const review = reviewData[id];
    if (!review) return;

    await supabase
      .from("submissions")
      .update({
        grade: review.grade,
        feedback: review.feedback,
      })
      .eq("id", id);

    loadSubmissions();
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Login</h1>

        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 260, background: "#0f172a", color: "white", padding: 20 }}>
        <button onClick={() => setActivePage("dashboard")}>Dashboard</button>
        <button onClick={() => setActivePage("assignments")}>Assignments</button>
        <button onClick={() => setActivePage("inbox")}>Inbox</button>
        <button onClick={() => setActivePage("grades")}>Grades</button>
        <button onClick={() => setActivePage("submissions")}>Submissions</button>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: 20 }}>
        {activePage === "dashboard" && (
          <div>
            <h1>Dashboard</h1>
          </div>
        )}

        {activePage === "assignments" && (
          <div>
            <h1>Assignments</h1>
          </div>
        )}

        {activePage === "inbox" && (
          <div>
            <h1>Inbox</h1>
          </div>
        )}

        {activePage === "grades" && (
          <div>
            <h1>Grades</h1>
          </div>
        )}

        {activePage === "submissions" && (
          <div>
            <h1>Submissions</h1>
          </div>
        )}
      </main>
    </div>
  );
}
