import React, { useEffect, useRef, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { AnimatePresence, motion } from 'framer-motion';
import { AccordionItem, AccordionProps } from "../types/accordion";


interface AccordionItemComponentProps {
    item: AccordionItem;
    index: number;
    level: number;
    lenght: number;
}

const AccordionItemComponent = ({ item, index, level = 0, lenght }: AccordionItemComponentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const height = calculateTotalHeight(contentRef.current);
            setMaxHeight(`${height}px`);
        } else {
            setMaxHeight("0px");
        }
    }, [isOpen]);

    const calculateTotalHeight = (element: HTMLDivElement | null): number => {
        if (!element) return 0
        let totalHeight = element.scrollHeight
        Array.from(element.children).forEach((child) => {
            if (child instanceof HTMLDivElement) {
                totalHeight += calculateTotalHeight(child)
            }
        });
        return totalHeight;
    };

    const [, setMaxHeight] = useState("0px");


    return (
        <div key={index} className={`w-full flex flex-col ${lenght - 1 !== index && "border-b-2 border-light-gray"} `}>
            <div className={`flex justify-between items-center text-white ${item.backgroundColor} ${(level === 0 && index === 0) && 'rounded-t-md'} ${(level === 0 && index === lenght - 1 && !isOpen) && 'rounded-b-md'} p-2 select-none cursor-pointer ${(lenght - 1 === index && isOpen) && "border-b-2 border-light-gray"}`}
                onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between w-full ">
                    <div className="w-full" style={{ paddingLeft: `${level}rem` }}>
                        {item.title}
                    </div>
                    <div className="flex justify-center items-center text-2xl tansition-all duration-300 ease-in-out"
                        style={{ transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                        <HiChevronLeft />
                    </div>
                </div>
            </div>
            <AnimatePresence initial={false} >
                {
                    isOpen && (
                        <motion.section
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { opacity: 1, height: "auto" },
                                collapsed: { opacity: 0, height: 0 },
                            }}
                            transition={{ duration: 0.3 }}>
                            <div className={`flex flex-col w-full bg-background overflow-hidden transition-all duration-400 ease-in-out ${(level === 0 && index === lenght - 1) && 'rounded-b-md'} `}>
                                {item.content && Array.isArray(item.content)
                                    ? item.content.map((subItem: AccordionItem, subIndex: number) => (
                                        <AccordionItemComponent
                                            key={`${index}-${subIndex}`}
                                            item={subItem}
                                            index={subIndex}
                                            level={level + 1}
                                            lenght={Array.isArray(item.content) ? item.content.length : 0}
                                        />
                                    ))
                                    : <div style={{ paddingLeft: `${level + 1}rem` }}>
                                        {item.content}
                                    </div>}
                            </div>
                        </motion.section>
                    )
                }
            </AnimatePresence>
        </div >
    );
};

const Accordion = ({ dataset, className }: AccordionProps) => {
    const [data, setData] = useState<AccordionItem[]>(dataset);

    useEffect(() => {
        setData(dataset);
    }, [dataset]);

    return (
        <div className={className}>
            {data.map((item: AccordionItem, index: number) => (
                <AccordionItemComponent key={index} item={item} index={index} level={0} lenght={data.length} />
            ))}
        </div>
    );
}

export default Accordion;