import Tag from "./Tag"

import "./TagInput.css";

const TagInput = ({placeholder, value, setValue, tags, setTags}: 
    {
        value: string,
        setValue: (value: string) => void,
        tags: string[], 
        setTags: (tag: string) => void
    }
) => {

    const onRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    }

    return (
        <div className="tag-input">
            <div className="tags">
                {tags.map((tag, index) => (
                    <Tag
                        key={index}
                        tag={tag}
                        onRemove={onRemoveTag}
                    />
                ))}
            </div>
            <input 
                type="text" 
                placeholder={placeholder}
                value={value} 
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    )
}

export default TagInput;