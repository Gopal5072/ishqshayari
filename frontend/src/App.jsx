import { useEffect, useState } from "react"
import ShayariCard from "./ShayariCard"

export default function App() {
  const [shayaris, setShayaris] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filteredShayaris, setFilteredShayaris] = useState([])
  const fetchShayaris = async () => {
    setLoading(true)
    const response = await fetch("https://ishqshayariv2-backend.vercel.app/api")
    const data = await response.json()
    if (data.status === "ok") {
      const formattedShayaris = data.shayaris.map((shayari) => {
        const date = new Date(shayari.date)
        const day = date.getDate().toString().padStart(2, "0")
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear()
        const formattedDate = `${day}/${month}/${year}`
        return { ...shayari, date: formattedDate }
      })
      setShayaris(formattedShayaris)
      setFilteredShayaris(formattedShayaris)
      setLoading(false)
    } else {
      setLoading(false)
      console.log(data.message)
    }
  }

  const realTimeSearch = (e) => {
    setSearch(e.target.value)
    let filtered = shayaris.filter(
      (shayari) =>
        shayari.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
        shayari.author.toLowerCase().includes(e.target.value.toLowerCase()) ||
        shayari.content.toLowerCase().includes(e.target.value.toLowerCase()) ||
        shayari.date.toLowerCase().includes(e.target.value.toLowerCase())
    )
    setFilteredShayaris(filtered)
    console.log(filtered)
  }

  useEffect(() => {
    fetchShayaris()
  }, [])
  return (
    <div className="max-w-screen-xl mx-auto scroll-smooth">
      <div className="relative isolate px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-24 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Shayari™ Official
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Made by Shayari lovers, for Shayari lovers!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <input
                type="text"
                value={search}
                placeholder="Search Shayari / Author"
                className="focus:outline-none text-white bg-transparent p-1.5 w-full border-b"
                onChange={realTimeSearch}
              />
            </div>
          </div>
          <div>
            {loading ? (
              <div className="text-center mt-10 text-gray-300">Loading...</div>
            ) : (
              filteredShayaris.map((shayari) => (
                <div
                  key={shayari._id}
                  className="mt-10 border-1 border-blue-200 shadow-lg rounded-lg overflow-auto"
                >
                  <ShayariCard shayari={shayari} />
                </div>
              ))
            )}
            {shayaris.length === 0 && !loading && (
              <div className="text-center mt-10 text-gray-300">
                No Shayaris found
              </div>
            )}
            {filteredShayaris.length === 0 &&
              shayaris.length !== 0 &&
              !loading && (
                <div className="text-center mt-10 text-gray-300">
                  No Shayari with the specified keywords found
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
