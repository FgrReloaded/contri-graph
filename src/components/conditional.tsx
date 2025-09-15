export default function Conditional({ condition, children }: { condition: boolean, children: React.ReactNode }) {
    return condition ? children : null;
}