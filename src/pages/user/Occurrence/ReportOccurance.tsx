import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ReportOccurance = () => {
  const navigate = useNavigate();
  const profileData = {
    name: "",
    dob: "98299213",
    Occurence: "Occurance",
  };
  const FormField = ({ label, type = "text", defaultValue }: { label: string; type?: string; defaultValue?: string }) => (
    <div className="flex flex-col gap-1 bg-[#222630]  w-full  p-4 border-b rounded-md outline-none">

      <input
        type={type}
        placeholder={label}
        defaultValue={defaultValue}
        className="bg-[#222630] text-[#F4F7FF] placeholder-[#98A1B3]"
      />
    </div>
  );
  return (
    <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] px-6 flex flex-col gap-6 justify-between pt-20">
      <div className='flex flex-col gap-10'>
        <div className="flex items-center gap-2 fixed px-6 py-6 top-0 left-0 w-full bg-[#181D26]">
          <ChevronLeft
            size={20}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-xl text-[#F4F7FF] font-normal font-noto">Report</h1>
        </div>

        <div className="flex flex-col gap-6">
          <FormField label="Category" defaultValue={profileData.name} />
          <FormField label="Date and TIme" defaultValue={profileData.dob} />
          <FormField label="Occourance" defaultValue={profileData.Occurence} />
        </div>
      </div>
      <div className='pb-9'>
        <Link to="/user/incident/report" className=' gap-3 w-full py-3  bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center py-3'>
          <p>Save Report</p>
        </Link>
      </div>
    </div>
  )
}

export default ReportOccurance