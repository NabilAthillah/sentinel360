import Loader from "./Loader"

const DeleteModal = ({setModal, handleDelete, loading}:{setModal:any, handleDelete:any, loading:boolean}) => {
    return (
        <div className="flex flex-col gap-8 bg-[#363F4F] py-8 px-[66.5px] rounded-2xl">
            <h2 className='text-2xl leading-[36px] text-white font-noto text-center'>Delete record?</h2>
            <div className="flex gap-4 justify-end flex-wrap">
                <button className="font-medium text-base leading-[21px] text-[#868686] bg-[#252C38] px-12 py-3 border-[1px] border-[#868686] rounded-full transition-all hover:bg-[#868686] hover:text-[#252C38]" onClick={() => setModal(false)}>Cancel</button>
                <button className="font-medium text-base leading-[21px] text-[#181D26] bg-[#EFBF04] px-12 py-3 border-[1px] border-[#EFBF04] rounded-full transition-all hover:bg-[#181D26] hover:text-[#EFBF04]" onClick={() => handleDelete()}>{loading ? <Loader primary/> : 'Confirm'}</button>
            </div>
        </div>
    )
}

export default DeleteModal