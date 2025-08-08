import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Report = () => {
    const navigate = useNavigate();
    const [managementReport, setManagementReport] = useState('Yes');
    const [policeReport, setPoliceReport] = useState('No');
    const [damageProperty, setDamageProperty] = useState('No');
    const [pictureAttached, setPictureAttached] = useState('No');
    const [cctvFootage, setCctvFootage] = useState('No');
    const profileData = {
        name: "",
        mobile: "98299213",
        email: "admin@pavo.com",
        dob: "02/10/1990",
        nric: "S7892108C",
        role: "Administrator",
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
    const RadioGroup = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
        <div className="flex flex-col gap-2">
            <p className="text-sm">{label}</p>
            <div className="flex gap-6">
                {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${value === option
                                ? 'border-[#EFBF04]'
                                : 'border-[#F4F7FF]'
                                }`}
                        >
                            {value === option && (
                                <span className="w-2 h-2 rounded-full bg-[#EFBF04]" />
                            )}
                        </span>
                        <input
                            type="radio"
                            value={option}
                            placeholder={option}
                            checked={value === option}
                            onChange={() => onChange(option)}
                            className="hidden"
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#181D26] text-[#F4F7FF] p-4 flex flex-col gap-6">

            <div className="flex items-center gap-3 pt-8">
                <ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />
                <h1 className="text-xl font-normal text-[#F4F7FF]">Report</h1>
            </div>

            <div className="flex flex-col gap-6">
                <FormField label="What Happened" defaultValue={profileData.name} />
                <FormField label="Date and TIme" defaultValue={profileData.dob} />
                <FormField label="Location" type="email" defaultValue={profileData.email} />
                <FormField label="Why it happened" defaultValue={profileData.mobile} />
                <FormField label="How it happened" defaultValue={profileData.nric} />
                <FormField label="Person involved" defaultValue={profileData.role} />
                <FormField label="Person injured" defaultValue={profileData.role} />
            </div>
            <RadioGroup
                label="Incident reported to management"
                value={managementReport}
                onChange={setManagementReport}
            />


            <FormField label="Remarks" defaultValue={profileData.mobile} />

            <RadioGroup
                label="Incident reported to Police/ SCDF"
                value={policeReport}
                onChange={setPoliceReport}
            />
            <RadioGroup
                label="Any damage to the property"
                value={damageProperty}
                onChange={setDamageProperty}
            />
            <RadioGroup
                label="Any picture attached"
                value={pictureAttached}
                onChange={setPictureAttached}
            />
            <RadioGroup
                label="Any CCTV footage"
                value={cctvFootage}
                onChange={setCctvFootage}
            />

            <div className="flex flex-col gap-2 mt-2">
                <p className="text-sm">Upload captured images</p>
                <label className="border border-[#EFBF04] text-[#EFBF04] rounded-full w-fit px-3 py-3 text-center cursor-pointer">
                    Upload file
                    <input type="file" className="hidden" />
                </label>
            </div>
            <FormField label="Detail of Incident" defaultValue={profileData.mobile} />
            <FormField label="Acknowlaged by" defaultValue={profileData.mobile} />

            <div className='flex flex-col gap-4 justify-center items-center  pt-24'>

                <Link to="/user/incident/history" className=' gap-3 w-full py-3 border border-[#EFBF04] text-[#EFBF04] rounded-full flex flex-row justify-center items-center py-3'>
                    <p>Signature</p>
                </Link>


                <Link to="/user/incident/report" className=' gap-3 w-full py-3  bg-[#EFBF04] text-[#181D26] rounded-full flex flex-row justify-center items-center py-3'>
                    <p>Save Report</p>
                </Link>
            </div>
        </div>
    );
};

export default Report;
