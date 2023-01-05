import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    text: string;
    icon?: any;
}

import "./Tooltip.css"

const Tooltip = (props: Props) => {
    const { text, icon } = props;

    return (
        <div className="tooltip">
            {icon && <FontAwesomeIcon icon={icon} />}
            <div className="tooltip__text">{text}</div>
        </div>
    );
};

export default Tooltip;