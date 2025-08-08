import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const HistoryOccurance = () => {
  const navigate = useNavigate();

  const data = [
    {
      id: 1,
      title: "Situation",
      description: "HDB",
      date: "2023-01-01",
      time: "10:00",
    },
    {
      id: 2,
      title: "HDB",
      description: "HDB",
      date: "2023-01-01",
      time: "10:00",
    }
  ];
  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <ChevronLeft
            size={20}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl text-[#F4F7FF] font-normal">HDB</h1>
        </div>
      </div>

      {data.map((item) => (
        <div
          key={item.id}
          className="bg-[#252C38] p-4 rounded-lg flex flex-col gap-3"
        >
          <div className="flex justify-between items-center">
            <p className="text-[#EFBF04] font-semibold">{item.title}</p>
            <div className="flex gap-3 text-[#98A1B3]">
              <Link to="/user/e-occurence/report/edit">
              <Pencil size={16} className="cursor-pointer" />
              </Link>
              <Trash2 size={16} className="cursor-pointer" />
            </div>
          </div>

          <div className="text-sm text-[#98A1B3] gap-2 flex flex-col">
            <div>
              <p className="mb-1 text-xs">Date & time</p>
              <p className="text-[#F4F7FF]">{item.date}, {item.time}</p>
            </div>
            
            <div>
              <p className="mb-1 text-xs">Occurance</p>
              <p className="text-[#F4F7FF]">{item.description}</p>
            </div>
          </div>


        </div>
      ))}
    </div>
  )
}

export default HistoryOccurance