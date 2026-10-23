import * as React from 'react';

import { APP_DESCRIPTION, APP_NAME } from '@workspace/common/app';

const SHIFTS = [
  { left: 0, width: 46, color: '#C5F23A' },
  { left: 22, width: 52, color: '#7DD3FC' },
  { left: 8, width: 38, color: '#FDBA74' },
  { left: 40, width: 58, color: '#C4B5FD' }
];

export function OgImage(): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#0E1209',
        color: '#F7F9F2',
        padding: '72px',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '58%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '7px',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              backgroundColor: '#C5F23A',
              padding: '0 14px'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: '#0E1209'
              }}
            />
            <div
              style={{
                width: '28px',
                height: '8px',
                marginLeft: '10px',
                borderRadius: '4px',
                backgroundColor: '#0E1209'
              }}
            />
            <div
              style={{
                width: '16px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(14, 18, 9, 0.4)'
              }}
            />
          </div>
          <div style={{ fontSize: '40px', fontWeight: 800 }}>
            {APP_NAME.toLowerCase()}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '76px',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-2px'
            }}
          >
            Next week&apos;s schedule.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '76px',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-2px',
              color: '#C5F23A'
            }}
          >
            One click.
          </div>
          <div
            style={{
              marginTop: '28px',
              fontSize: '28px',
              lineHeight: 1.4,
              color: 'rgba(247, 249, 242, 0.7)'
            }}
          >
            {APP_DESCRIPTION}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '22px',
          width: '42%',
          paddingLeft: '56px'
        }}
      >
        {SHIFTS.map((shift, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(247, 249, 242, 0.06)',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: `${shift.left}%`,
                width: `${shift.width}%`,
                borderRadius: '10px',
                backgroundColor: shift.color
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
