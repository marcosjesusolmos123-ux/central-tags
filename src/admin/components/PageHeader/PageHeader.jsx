import "./PageHeader.css";
export function PageHeader({ eyebrow, title, description, actions }) { return <header className="admin-page-header"><div>{eyebrow && <span className="admin-page-header__eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="admin-page-header__actions">{actions}</div>}</header>; }
