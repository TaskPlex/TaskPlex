/**
 * MSW Request Handlers
 * Define mock API responses for testing and development
 */
import { http, HttpResponse, delay } from 'msw';

// Match any API URL pattern (localhost or other)
const API_PATTERN = '*/api/v1';

// Helper to create successful response
const successResponse = <T extends object>(data: T) => ({
  success: true,
  ...data,
});

// Helper to create error response
const errorResponse = (message: string, status = 400) =>
  HttpResponse.json({ success: false, error: message }, { status });

// ============================================
// VIDEO HANDLERS
// ============================================

// Store for tracking async tasks (for testing)
const taskStore = new Map<string, {
  status: 'processing' | 'completed' | 'error';
  progress: number;
  result?: object;
  error?: string;
}>();

// Helper to generate task ID
const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const videoHandlers = [
  // Compress video (synchronous - legacy)
  http.post(`${API_PATTERN}/video/compress`, async () => {
    await delay(50); // Simulate network delay
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed_video.mp4',
        filename: 'compressed_video.mp4',
        original_size: 10485760, // 10MB
        processed_size: 5242880, // 5MB
        compression_ratio: 50,
      })
    );
  }),

  // Compress video (async with SSE progress)
  http.post(`${API_PATTERN}/video/compress/async`, async () => {
    await delay(30);
    const taskId = generateTaskId();
    
    // Initialize task in store
    taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });

    // Simulate processing progress (for testing)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        taskStore.set(taskId, {
          status: 'completed',
          progress: 100,
          result: {
            success: true,
            download_url: '/api/v1/download/compressed_video.mp4',
            filename: 'compressed_video.mp4',
            original_size: 10485760,
            processed_size: 5242880,
            compression_ratio: 50,
          },
        });
        clearInterval(progressInterval);
      } else {
        taskStore.set(taskId, { status: 'processing', progress });
      }
    }, 100);

    return HttpResponse.json({ task_id: taskId });
  }),

  // Convert video (synchronous - legacy)
  http.post(`${API_PATTERN}/video/convert`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/converted_video.webm',
        filename: 'converted_video.webm',
        original_size: 10485760,
        processed_size: 8388608,
      })
    );
  }),

  // Video to GIF (synchronous)
  http.post(`${API_PATTERN}/video/to-gif`, async () => {
    await delay(40);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/preview.gif',
        filename: 'preview.gif',
        original_size: 2048000,
        processed_size: 512000,
      })
    );
  }),

  // Extract audio from video
  http.post(`${API_PATTERN}/video/extract-audio`, async () => {
    await delay(35);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/audio.mp3',
        filename: 'audio.mp3',
        original_size: 10485760,
        processed_size: 1048576,
      })
    );
  }),

  // Password generator
  http.post(`${API_PATTERN}/password/generate`, async () => {
    await delay(20);
    return HttpResponse.json(
      successResponse({
        password: 'S3cur3!Passw0rd',
      })
    );
  }),

  // Password checker
  http.post(`${API_PATTERN}/password/check`, async () => {
    await delay(20);
    return HttpResponse.json(
      successResponse({
        score: 82,
        strength: 'strong',
        length: 14,
        has_lowercase: true,
        has_uppercase: true,
        has_digits: true,
        has_symbols: true,
        suggestions: [],
        entropy: 70.5,
      })
    );
  }),

  // UUID generator
  http.post(`${API_PATTERN}/uuid/generate`, async () => {
    await delay(15);
    return HttpResponse.json(
      successResponse({
        uuids: ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'],
      })
    );
  }),

  // Convert video (async with SSE progress)
  http.post(`${API_PATTERN}/video/convert/async`, async () => {
    await delay(30);
    const taskId = generateTaskId();
    
    taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });

    // Simulate processing
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        taskStore.set(taskId, {
          status: 'completed',
          progress: 100,
          result: {
            success: true,
            download_url: '/api/v1/download/converted_video.webm',
            filename: 'converted_video.webm',
            original_size: 10485760,
            processed_size: 8388608,
          },
        });
        clearInterval(progressInterval);
      } else {
        taskStore.set(taskId, { status: 'processing', progress });
      }
    }, 80);

    return HttpResponse.json({ task_id: taskId });
  }),
];

// ============================================
// TASK HANDLERS (for SSE progress tracking)
// ============================================
export const taskHandlers = [
  // Get task status (polling fallback)
  http.get(`${API_PATTERN}/tasks/:taskId/status`, async ({ params }) => {
    const { taskId } = params;
    const task = taskStore.get(taskId as string);

    if (!task) {
      return HttpResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      task_id: taskId,
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
    });
  }),

  // SSE stream endpoint (returns task status for testing)
  // Note: Real SSE is not fully supported in MSW, so this returns JSON
  // In real tests, you would mock the EventSource or test components individually
  http.get(`${API_PATTERN}/tasks/:taskId/stream`, async ({ params }) => {
    const { taskId } = params;
    const task = taskStore.get(taskId as string);

    if (!task) {
      return HttpResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Return current status (in real scenario, this would be SSE stream)
    return HttpResponse.json({
      task_id: taskId,
      status: task.status,
      progress: task.progress,
      result: task.result,
    });
  }),
];

// ============================================
// IMAGE HANDLERS
// ============================================
export const imageHandlers = [
  // Compress image
  http.post(`${API_PATTERN}/image/compress`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed_image.jpg',
        filename: 'compressed_image.jpg',
        original_size: 2097152, // 2MB
        processed_size: 524288, // 512KB
        compression_ratio: 75,
      })
    );
  }),

  // Convert image
  http.post(`${API_PATTERN}/image/convert`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/converted_image.webp',
        filename: 'converted_image.webp',
        original_size: 2097152,
        processed_size: 1048576,
      })
    );
  }),
];

// ============================================
// PDF HANDLERS
// ============================================
export const pdfHandlers = [
  // Compress PDF
  http.post(`${API_PATTERN}/pdf/compress`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed.pdf',
        filename: 'compressed.pdf',
        original_size: 5242880, // 5MB
        processed_size: 2621440, // 2.5MB
      })
    );
  }),

  // Merge PDFs
  http.post(`${API_PATTERN}/pdf/merge`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/merged.pdf',
        filename: 'merged.pdf',
      })
    );
  }),

  // Split PDF
  http.post(`${API_PATTERN}/pdf/split`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        filenames: ['page_1.pdf', 'page_2.pdf', 'page_3.pdf'],
        download_urls: [
          '/api/v1/download/page_1.pdf',
          '/api/v1/download/page_2.pdf',
          '/api/v1/download/page_3.pdf',
        ],
      })
    );
  }),

  // Reorganize PDF
  http.post(`${API_PATTERN}/pdf/reorganize`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/reorganized.pdf',
        filename: 'reorganized.pdf',
      })
    );
  }),
];

// ============================================
// REGEX HANDLERS
// ============================================
export const regexHandlers = [
  http.post(`${API_PATTERN}/regex/validate`, async ({ request }) => {
    await delay(30);
    
    const body = await request.json() as { pattern: string; text: string; flags: string };
    const { pattern, text, flags } = body;

    try {
      const regex = new RegExp(pattern, flags);
      const matches: Array<{ start: number; end: number; match: string; groups: string[] }> = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            match: match[0],
            groups: match.slice(1),
          });
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            match: match[0],
            groups: match.slice(1),
          });
        }
      }

      return HttpResponse.json({
        success: true,
        matches,
        count: matches.length,
      });
    } catch {
      return errorResponse('Invalid regex pattern');
    }
  }),
];

// ============================================
// UNITS HANDLERS
// ============================================
export const unitsHandlers = [
  http.post(`${API_PATTERN}/units/convert`, async ({ request }) => {
    await delay(30);
    
    const body = await request.json() as { value: number; from_unit: string; to_unit: string };
    const { value, from_unit, to_unit } = body;

    // Simple conversion logic for testing
    type ConversionValue = number | ((v: number) => number);
    const conversions: Record<string, Record<string, ConversionValue>> = {
      meter: { kilometer: 0.001, centimeter: 100, millimeter: 1000, mile: 0.000621371, foot: 3.28084 },
      kilometer: { meter: 1000, mile: 0.621371 },
      kilogram: { gram: 1000, pound: 2.20462 },
      degC: { degF: (v: number) => v * 9/5 + 32, kelvin: (v: number) => v + 273.15 },
    };

    let converted_value = value;
    
    const conversion = conversions[from_unit]?.[to_unit];
    if (conversion !== undefined) {
      converted_value = typeof conversion === 'function' ? conversion(value) : value * conversion;
    } else if (from_unit === to_unit) {
      converted_value = value;
    }

    return HttpResponse.json({
      success: true,
      original_value: value,
      converted_value,
      from_unit,
      to_unit,
    });
  }),
];

// ============================================
// QR CODE HANDLERS
// ============================================
export const qrcodeHandlers = [
  http.post(`${API_PATTERN}/qrcode/generate`, async ({ request }) => {
    await delay(100);
    
    const body = await request.json() as { data: string; size?: number; border?: number; error_correction?: string };
    const { data } = body;

    if (!data || data.trim().length === 0) {
      return errorResponse('Data is required');
    }

    if (data.length > 2953) {
      return errorResponse('Data too long (max 2953 characters)');
    }

    // Generate a mock filename
    const filename = `qrcode_${Date.now()}.png`;

    return HttpResponse.json({
      success: true,
      message: 'QR code generated successfully',
      qr_code_url: `/api/v1/download/${filename}`,
      filename,
    });
  }),
];

// ============================================
// COLOR HANDLERS
// ============================================
export const colorHandlers = [
  http.post(`${API_PATTERN}/color/convert`, async ({ request }) => {
    await delay(40);
    const body = await request.json() as { color?: string };
    const normalizedHex = body.color && typeof body.color === 'string' && body.color.startsWith('#')
      ? body.color
      : '#112233';

    return HttpResponse.json({
      success: true,
      message: 'Color converted successfully',
      input_format: 'hex',
      normalized_hex: normalizedHex,
      formats: {
        hex: normalizedHex,
        rgb: 'rgb(17, 34, 51)',
        hsl: 'hsl(210, 50%, 13%)',
        cmyk: 'cmyk(67%, 33%, 0%, 80%)',
      },
      components: {
        r: 17,
        g: 34,
        b: 51,
        h: 210,
        s: 50,
        l: 13,
        c: 66.67,
        m: 33.33,
        y: 0,
        k: 80,
      },
    });
  }),
];

// ============================================
// DOWNLOAD HANDLER
// ============================================
export const downloadHandlers = [
  http.get(`${API_PATTERN}/download/:filename`, async ({ params }) => {
    await delay(30);
    const { filename } = params;
    
    // Return a mock blob for downloads
    return new HttpResponse(new Blob(['mock file content']), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),
];

// ============================================
// ERROR SCENARIOS (for testing error handling)
// ============================================
export const errorHandlers = {
  // Server error
  serverError: http.post(`${API_PATTERN}/*`, () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Network timeout
  timeout: http.post(`${API_PATTERN}/*`, async () => {
    await delay(30000); // 30 second delay
    return HttpResponse.json({ success: true });
  }),

  // Validation error
  validationError: http.post(`${API_PATTERN}/*`, () => {
    return HttpResponse.json(
      { success: false, error: 'Invalid file format' },
      { status: 400 }
    );
  }),
};

// ============================================
// ALL HANDLERS
// ============================================
// Hash handler
export const hashHandlers = [
  http.post(`${API_PATTERN}/hash/generate`, async ({ request }) => {
    const body = (await request.json()) as { text?: string; algorithm?: string; uppercase?: boolean };
    const algo = (body.algorithm || 'sha256').toLowerCase();
    const uppercase = body.uppercase ?? false;
    const fakeHex = uppercase ? 'FAKEHASH' : 'fakehash';

    return HttpResponse.json(
      successResponse({
        message: 'Hash generated successfully',
        algorithm: algo,
        hex_digest: fakeHex,
        base64_digest: 'ZmFrZWhhc2g=',
      })
    );
  }),
];

// Base64 handlers
export const base64Handlers = [
  http.post(`${API_PATTERN}/base64/encode`, async ({ request }) => {
    const body = (await request.json()) as { text?: string };
    const text = body.text || '';
    return HttpResponse.json(successResponse({ result: btoa(text) }));
  }),
  http.post(`${API_PATTERN}/base64/decode`, async ({ request }) => {
    const body = (await request.json()) as { text?: string };
    const text = body.text || '';
    try {
      const decoded = atob(text);
      return HttpResponse.json(successResponse({ result: decoded }));
    } catch {
      return errorResponse('Invalid Base64', 400);
    }
  }),
];

export const handlers = [
  ...videoHandlers,
  ...taskHandlers,
  ...imageHandlers,
  ...pdfHandlers,
  ...regexHandlers,
  ...unitsHandlers,
  ...qrcodeHandlers,
  ...colorHandlers,
  ...hashHandlers,
  ...base64Handlers,
  ...downloadHandlers,
];

