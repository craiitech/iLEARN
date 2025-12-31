import { SpeedGraderView } from "@/components/grading/speed-grader-view";

const mockSubmission = {
    student: { name: "Liam Johnson", email: "liam@example.com" },
    assignment: { title: "Final Project Proposal" },
    submittedAt: new Date(),
    submissionUrl: "https://docs.google.com/document/d/1V3t5tB8F9n5qV6F8d7s6g5f4h3j2k1l0p9o8i7u6y5/edit?usp=sharing",
    grade: null,
    feedback: [],
};

const mockRubric = {
    criteria: [
        { name: "Clarity of Thesis", points: 5, description: "The thesis is clear, concise, and arguable." },
        { name: "Supporting Evidence", points: 10, description: "Evidence is relevant, sufficient, and well-integrated." },
        { name: "Structure and Organization", points: 5, description: "The proposal is logically structured." },
        { name: "Formatting and Citations", points: 5, description: "Follows MLA formatting guidelines correctly." },
    ]
};

const mockCommentBank = [
    "Excellent work! Your thesis is very strong.",
    "Consider adding more specific examples to support your claims.",
    "Please double-check your citations for proper formatting.",
    "Well-structured and easy to follow argument.",
];


// This would fetch real data based on params.submissionId
export default async function GradingSubmissionPage({ params }: { submissionId: string }) {
    return (
        <div className="-m-4 lg:-m-6">
            <SpeedGraderView 
                submission={mockSubmission}
                rubric={mockRubric}
                commentBank={mockCommentBank}
            />
        </div>
    )
}
