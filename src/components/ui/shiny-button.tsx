'use client'

/**
 * @author: @emerald-ui
 * @description: Shiny Button Component - A button with a shiny gradient effect
 * @version: 1.0.0
 * @date: 2026-02-11
 * @license: MIT
 * @website: https://emerald-ui.com
 */
import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }

export default function ShinyButton({
  className,
  children = 'Shiny Day',
  ...props
}: any) {
  return (
    <button
      className={cn(
        'relative h-12 w-max rounded-full border border-foreground/20 bg-gradient-to-br from-[#00356B] to-[#002855] px-8 py-2 font-black text-white shadow-[0_10px_40px_rgba(0,53,107,0.4)] transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_50px_rgba(0,53,107,0.6)] hover:border-foreground/30 active:scale-95 overflow-hidden group',
        className
      )}
      type='button'
      {...props}
    >
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Animated Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
      
      {/* Content wrapper for scaling */}
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        {children}
      </span>
    </button>
  )
}
