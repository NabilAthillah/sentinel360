import React, { useRef, useState } from 'react';

const Upload = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFileName(e.target.files[0].name);
        }
    };

    const triggerFileInput = () => {
        inputRef.current?.click();
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs leading-[21px] text-[#98A1B3]">Video <span className='text-xs'>(Max file size: 5MB)</span></label>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={triggerFileInput}
                    className="font-medium text-sm leading-[21px] text-[#EFBF04] px-5 py-2 border-[1px] border-[#EFBF04] rounded-full cursor-pointer w-fit transition-all hover:bg-[#EFBF04] hover:text-[#252C38]"
                >
                    Upload file
                </button>
                {fileName && (
                    <span className="text-sm text-[#98A1B3]">{fileName}</span>
                )}
            </div>
            <input
                type="file"
                accept="video/*"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    )
}

export default Upload