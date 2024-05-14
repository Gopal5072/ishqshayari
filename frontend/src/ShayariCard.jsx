import React from "react"

const ShayariCard = ({ shayari }) => {
  return (
    <div
      className="relative h-96 bg-cover bg-center border-2 rounded-2xl border-cyan-200"
      style={{
        backgroundImage: `url(${shayari.image})`,
      }}
    >
      <div className="absolute top-0 left-0 text-white p-4">
        <p className="text-lg">{shayari.date}</p>
      </div>
      <div className="absolute top-0 right-0 text-white p-4">
        <p className="text-lg">
          By <span className="font-bold">{shayari.author}</span>
        </p>
      </div>
      <div className="text-center text-white z-10 flex flex-col items-center justify-center pt-20">
        <h1 className="text-3xl font-bold">{shayari.title}</h1>
        <p className="whitespace-pre overflow-auto max-h-60 max-w-full mt-5">
          {shayari.content}
        </p>
      </div>
    </div>
  )
}

export default ShayariCard
