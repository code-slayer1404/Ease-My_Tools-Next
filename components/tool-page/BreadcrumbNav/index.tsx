import Link from "next/link";

import styles from "./styles.module.css";

type BreadcrumbItem = {
    name: string;
    href?: any;
};

type BreadcrumbNavProps = {
    items: BreadcrumbItem[];
};

export default function BreadcrumbNav({
    items,
}: BreadcrumbNavProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={styles.breadcrumbNav}
        >
            <ol className={styles.breadcrumbList}>
                {items.map((item, index) => {
                    const isLast =
                        index === items.length - 1;

                    return (
                        <li
                            key={`${item.name}-${index}`}
                            className={styles.breadcrumbItem}
                        >
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className={styles.breadcrumbLink}
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        styles.breadcrumbCurrent
                                    }
                                >
                                    {item.name}
                                </span>
                            )}

                            {!isLast && (
                                <span
                                    className={
                                        styles.separator
                                    }
                                    aria-hidden="true"
                                >
                                    »
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}