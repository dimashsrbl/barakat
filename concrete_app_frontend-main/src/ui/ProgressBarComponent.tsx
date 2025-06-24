interface props {
    is_finished: boolean
    realized_cubature: any
    loading_cubature: any
    remain_cubature: any
    height?: any
}

export const ProgressBarComponent = ({is_finished, realized_cubature, loading_cubature, remain_cubature, height='24px'}: props) => {
    return (
        <div className={`progressBar df jcc aic w100`} style={{height}}>
        {is_finished ? (
            <div className={`greenProgress fz14`} style={{ width: `${(realized_cubature / (realized_cubature + loading_cubature + remain_cubature)) * 100 + 100}%`, height }}>
                <span className='progressText'>{`${realized_cubature}`}</span>
            </div>
        ) : (
            <>
                {realized_cubature !== 0 && (
                    <div className={`greenProgress fz14`} style={{ width: `${(realized_cubature / (realized_cubature + loading_cubature + remain_cubature)) * 100 + 20}%`, height }}>
                        <span className={`progressText`}>{`${realized_cubature}`}</span>
                    </div>
                )}
                {loading_cubature !== 0 && (
                    <div className={`yellowProgress fz14`} style={{ width: `${(loading_cubature / (realized_cubature + loading_cubature + remain_cubature)) * 100 + 20}%`, height }}>
                        <span className={`progressText`}>{`${loading_cubature}`}</span>
                    </div>
                )}
                {remain_cubature !== 0 && (
                    <div className={`grayProgress fz14`} style={{ width: `${(remain_cubature / (realized_cubature + loading_cubature + remain_cubature)) * 100 + 20}%`, height }}>
                        <span className={`progressText`}>{`${remain_cubature}`}</span>
                    </div>
                )}
            </>
        )}
    </div>
    )
}