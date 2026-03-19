import { Button } from './button';

export default {
    title: 'Components/UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        },
        size: {
            control: { type: 'select' },
            options: ['default', 'sm', 'lg', 'icon'],
        },
    },
};

export const Default = {
    args: {
        children: 'Button',
        variant: 'default',
        size: 'default',
    },
};

export const Destructive = {
    args: {
        children: 'Destructive',
        variant: 'destructive',
    },
};

export const Outline = {
    args: {
        children: 'Outline',
        variant: 'outline',
    },
};

export const Ghost = {
    args: {
        children: 'Ghost',
        variant: 'ghost',
    },
};

export const Small = {
    args: {
        children: 'Small Button',
        size: 'sm',
    },
};

export const Large = {
    args: {
        children: 'Large Button',
        size: 'lg',
    },
};
