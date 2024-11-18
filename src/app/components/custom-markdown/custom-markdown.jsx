import style from "./markdown-styles.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CustomMarkdown = (props) => {
  return (
    <ReactMarkdown className={style.reactMarkdown} skipHtml remarkPlugins={[remarkGfm]}>
      {props.content}
    </ReactMarkdown>
  );
};

export default CustomMarkdown;
