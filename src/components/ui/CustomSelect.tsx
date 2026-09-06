import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  group?: string
}

interface CustomSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: boolean
  groups?: string[]
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  error = false,
  groups,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const groupedOptions = groups
    ? groups.map((g) => ({ group: g, items: options.filter((o) => o.group === g) }))
    : null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '13px 40px 13px 16px',
          background: open ? 'rgba(37,99,235,0.06)' : 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-danger)' : open ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--font-size-base)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: open ? '0 0 0 3px var(--color-primary-glow)' : 'none',
        }}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          color="var(--text-muted)"
          style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#111e35',
            border: '1px solid var(--color-border-2)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            animation: 'scale-in 0.15s ease',
          }}
        >
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {groupedOptions ? (
              groupedOptions.map(({ group, items }) =>
                items.length > 0 ? (
                  <div key={group}>
                    <div
                      style={{
                        padding: '8px 14px 4px',
                        fontSize: 10,
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      {group}
                    </div>
                    {items.map((opt) => (
                      <OptionItem
                        key={opt.value}
                        option={opt}
                        isSelected={opt.value === value}
                        onClick={() => { onChange(opt.value); setOpen(false) }}
                      />
                    ))}
                  </div>
                ) : null
              )
            ) : (
              options.map((opt) => (
                <OptionItem
                  key={opt.value}
                  option={opt}
                  isSelected={opt.value === value}
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function OptionItem({
  option,
  isSelected,
  onClick,
}: {
  option: SelectOption
  isSelected: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        padding: '11px 14px',
        background: isSelected
          ? 'rgba(37,99,235,0.18)'
          : hover
          ? 'rgba(255,255,255,0.05)'
          : 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)',
        fontWeight: isSelected ? 600 : 400,
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.1s ease',
      }}
    >
      {option.label}
      {isSelected && <Check size={14} />}
    </button>
  )
}
