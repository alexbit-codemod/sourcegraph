import { useTranslation } from "react-i18next";
const Component: React.FunctionComponent<{}> = () => {
const { t } = useTranslation("../../../docker-images/syntax-highlighter/crates/syntax-analysis/src/highlighting/snapshots/files");

    let name = 'id'
    return (
        <div>
            <p />
            <h1 id={name}>{t('my-component')}</h1>
            {[1, 2, 3].map(item => (
                <p key={item}>{item}</p>
            ))}
        </div>
    )
}
