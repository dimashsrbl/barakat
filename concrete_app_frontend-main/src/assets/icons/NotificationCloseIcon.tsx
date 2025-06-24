interface props {
    height?: number
    width?: number
}

export const NotificationCloseIcon = ({ height = 15, width = 15 }: props) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 15 16" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.79293 8.00004L1.14648 2.35359L1.85359 1.64648L7.50004 7.29293L13.1465 1.64648L13.8536 2.35359L8.20714 8.00004L13.8536 13.6465L13.1465 14.3536L7.50004 8.70714L1.85359 14.3536L1.14648 13.6465L6.79293 8.00004Z" fill="#BDBDBD"/>
        </svg>
    )
}
