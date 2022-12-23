import React from 'react'

const Tag = ({ label, onRemove, className, ...props }: 
    {
        label: string,
        onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void,
        className?: string
    }
) => {
    return (
        <div className="tag" {...props}>
            <p className="tag-label">{label}</p>
            <button className="tag-close" onClick={onRemove}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#00000035" xmlns="http://www.w3.org/2000/svg" />
            </button>
        </div>
    )
}

export default Tag