import React, { type SVGProps } from 'react'

interface CodyLogoProps extends SVGProps<SVGSVGElement> {
    withColor?: boolean
}

export const CodyLogo: React.FunctionComponent<React.PropsWithChildren<CodyLogoProps>> = ({
    withColor,
    ...props
}: CodyLogoProps) => (
    <svg width="24" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M13.9088 4C14.756 4 15.4429 4.69836 15.4429 5.55983V8.33286C15.4429 9.19433 14.756 9.89269 13.9088 9.89269C13.0615 9.89269 12.3747 9.19433 12.3747 8.33286V5.55983C12.3747 4.69836 13.0615 4 13.9088 4Z"
            fill={withColor ? '#FF5543' : '#a6b6d9'}
        />
        <path
            d="M4.19287 7.63942C4.19287 6.77795 4.87971 6.07959 5.72696 6.07959H8.45423C9.30148 6.07959 9.98832 6.77795 9.98832 7.63942C9.98832 8.50089 9.30148 9.19925 8.45423 9.19925H5.72696C4.87971 9.19925 4.19287 8.50089 4.19287 7.63942Z"
            fill={withColor ? '#A112FF' : '#a6b6d9'}
        />
        <path
            d="M17.5756 12.1801C18.1216 12.7075 18.1437 13.5851 17.625 14.1403L17.1423 14.6569C13.3654 18.6994 6.99777 18.5987 3.34628 14.4387C2.84481 13.8674 2.89377 12.9909 3.45565 12.481C4.01752 11.9711 4.87954 12.0209 5.38102 12.5922C7.97062 15.5424 12.4865 15.6139 15.1651 12.747L15.6477 12.2304C16.1664 11.6752 17.0296 11.6527 17.5756 12.1801Z"
            fill={withColor ? '#00CBEC' : '#a6b6d9'}
        />
    </svg>
)
