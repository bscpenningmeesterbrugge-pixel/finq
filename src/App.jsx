import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function App() {
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

const [assignments, setAssignments] = useState([])

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

useEffect(() => {
checkUser()
}, [])

const checkUser = async () => {
const { data } = await supabase.auth.getUser()

```
setUser(data?.user || null)

if (data?.user) {
  loadAssignments()
}

setLoading(false)
```

}

const loadAssignments = async () => {
const { data } = await supabase
.from('assignments')
.select('*')

```
setAssignments(data || [])
```

}

const login = async () => {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
})

```
if (error) {
  alert(error.message)
  return
}

checkUser()
```

}

const logout = async () => {
await supabase.auth.signOut()
setUser(null)
}

if (loading) {
return <div style={{ padding: 40 }}>Loading...</div>
}

if (!user) {
return (
<div
style={{
minHeight: '100vh',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
background: '#f1f5f9',
}}
>
<div
style={{
background: 'white',
padding: 30,
borderRadius: 12,
width: 320,
}}
> <h1>Ultimate Smartschool</h1>

```
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
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
          width: '100%',
          padding: 10,
          marginBottom: 10,
        }}
      />

      <button
        onClick={login}
        style={{
          width: '100%',
          padding: 10,
          background: '#0f172a',
          color: 'white',
          border: 'none',
          borderRadius: 8,
        }}
      >
        Login
      </button>
    </div>
  </div>
)
```

}

return (
<div style={{ minHeight: '100vh', background: '#f8fafc' }}>
<div
style={{
background: '#0f172a',
color: 'white',
padding: 20,
display: 'flex',
justifyContent: 'space-between',
}}
> <h2>Ultimate Smartschool Dashboard</h2>

```
    <button onClick={logout}>
      Logout
    </button>
  </div>

  <div style={{ padding: 20 }}>
    <h3>Assignments</h3>

    {assignments.map((a) => (
      <div
        key={a.id}
        style={{
          background: 'white',
          padding: 16,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <strong>{a.title}</strong>
      </div>
    ))}
  </div>
</div>
```

)
}

