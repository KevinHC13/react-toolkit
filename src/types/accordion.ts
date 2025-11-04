interface AccordionProps {
    dataset: AccordionItem[];
    className?: string;
}

interface AccordionItem {
    title: React.ReactNode;
    backgroundColor?: string;
    content?: React.ReactNode | AccordionItem[];
}

export {
    AccordionItem,
    AccordionProps
}