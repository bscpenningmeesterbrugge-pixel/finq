
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
  const [user, setUser] = useState(null)
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data?.user || null)

    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*')

    setAssignments(assignmentsData || [])
  }

  const login = async () => {
    const email = prompt('Email')
    const password = prompt('Password')

    await supabase.auth.signInWithPassword({
      email,
      password,
    })

    checkUser()
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Ultimate Smartschool</h1>
        <button onClick={login}>Login</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Assignments</h1>

      {assignments.map((a) => (
        <div key={a.id} style={{ marginBottom: 10 }}>
          {a.title}
        </div>
      ))}
    </div>
  )
}
