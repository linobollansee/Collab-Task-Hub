import React, { ButtonHTMLAttributes, FormHTMLAttributes, InputHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export interface FormWrapperProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface WrapperProps {
  children: React.ReactNode;
}
