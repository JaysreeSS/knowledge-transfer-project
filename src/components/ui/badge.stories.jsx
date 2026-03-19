import { Badge } from './badge';

export default {
    title: 'Components/UI/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                'default',
                'secondary',
                'destructive',
                'outline',
                'soft',
                'success',
                'warning',
                'blue',
                'purple',
                'indigo',
            ],
        },
    },
};

export const Default = {
    args: {
        children: 'Badge',
        variant: 'default',
    },
};

export const Secondary = {
    args: {
        children: 'Secondary',
        variant: 'secondary',
    },
};

export const Success = {
    args: {
        children: 'Success',
        variant: 'success',
    },
};

export const Warning = {
    args: {
        children: 'Warning',
        variant: 'warning',
    },
};

export const Outline = {
    args: {
        children: 'Outline',
        variant: 'outline',
    },
};
