import React, { useState, useMemo } from 'react';

interface DescriptionCardProps {
    description: string;
}

const DESCRIPTION_THRESHOLD = 250;

const DescriptionCard: React.FC<DescriptionCardProps> = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isLongDescription = useMemo(() => description.length > DESCRIPTION_THRESHOLD, [description]);

    const displayedDescription = useMemo(() => {
        if (!isLongDescription || isExpanded) {
            return description;
        }
        return `${description.substring(0, DESCRIPTION_THRESHOLD)}...`;
    }, [description, isLongDescription, isExpanded]);

    return (
        <section>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Descripción</h3>
                </div>
                <div className="p-6">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {displayedDescription}
                    </p>
                    {isLongDescription && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-4 text-lg font-bold text-rago-burgundy hover:text-rago-burgundy-darker transition-colors duration-200"
                        >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DescriptionCard;
