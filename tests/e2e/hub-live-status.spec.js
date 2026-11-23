import { test, expect } from '@playwright/test';

const apiBase = 'https://petchnikka-jarvis-core.onrender.com/api/integrations';
const keys = [
  'admin','finance','marketing','sales','support','operations','technology',
  'research_development','procurement','audit','legal','ai_resources','security',
  'risk','data_information','communications','maintenance_recovery'
];

function departmentPayload(timestamp = new Date().toISOString()) {
  const failed = new Set(['marketing', 'operations', 'ai_resources']);
  return {
    service: 'PETCHNIKKA JARVIS CORE',
    integration: 'project_hub_department_status',
    status: 'degraded',
    source: 'jarvis_tasks_aggregate',
    read_only: true,
    fetched_at: timestamp,
    timestamp,
    counts: { total: 17, running: 0, queued: 0, completed: 14, failed: 3, no_data: 0, unknown: 0 },
    departments: keys.map(key => ({
      key,
      name: key,
      status: failed.has(key) ? 'failed' : 'completed',
      last_activity_at: timestamp
    }))
  };
}

function uptimePayload(timestamp = new Date().toISOString()) {
  return {
    service: 'PETCHNIKKA JARVIS CORE',
    integration: 'uptimerobot_public_status',
    status: 'connected',
    provider: 'UptimeRobot',
    read_only: true,
    counts: { total: 15, up: 15, down: 0, paused: 0, pending: 0, unknown: 0 },
    fetched_at: timestamp,
    timestamp
  };
}

async function mockHealthyApis(page, dept = departmentPayload(), uptime = uptimePayload()) {
  await page.route(`${apiBase}/uptimerobot/public-status`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(uptime) }));
  await page.route(`${apiBase}/project-hub/department-status`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dept) }));
}

test('renders live-shaped UptimeRobot and all 17 department records', async ({ page }) => {
  await mockHealthyApis(page);
  await page.goto('/');
  await expect(page.locator('#monitor-state')).toHaveAttribute('data-state', 'connected');
  await expect(page.locator('#monitor-total')).toHaveText('15');
  await expect(page.locator('#monitor-up')).toHaveText('15');
  await expect(page.locator('#dept-connection')).toHaveAttribute('data-state', 'degraded');
  await expect(page.locator('#dept-failed')).toHaveText('3');
  await expect(page.locator('#dept-completed')).toHaveText('14');
  await expect(page.locator('#dept-no-data')).toHaveText('0');
  await expect(page.locator('#dept-unknown')).toHaveText('0');
  await expect(page.locator('.department')).toHaveCount(17);
  await expect(page.locator('.department[data-status="failed"]')).toHaveCount(3);
  await expect(page.locator('#dept-updated')).toContainText('ข้อมูลภารกิจล่าสุด');
});

test('clears live values and displays unavailable when either API fails', async ({ page }) => {
  await page.route(`${apiBase}/uptimerobot/public-status`, route => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.route(`${apiBase}/project-hub/department-status`, route => route.abort());
  await page.goto('/');
  await expect(page.locator('#monitor-state')).toHaveAttribute('data-state', 'unavailable');
  await expect(page.locator('#monitor-total')).toHaveText('—');
  await expect(page.locator('#hero-up')).toHaveText('—');
  await expect(page.locator('#dept-connection')).toHaveAttribute('data-state', 'unavailable');
  await expect(page.locator('#dept-total')).toHaveText('—');
  await expect(page.locator('#hero-dept-state')).toHaveText('—');
  await expect(page.locator('#dept-updated')).toContainText('ไม่สามารถยืนยันข้อมูล');
  await expect(page.locator('.department[data-status="no_data"]')).toHaveCount(17);
});

test('marks old snapshots as degraded instead of presenting them as fresh', async ({ page }) => {
  const old = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await mockHealthyApis(page, departmentPayload(old), uptimePayload(old));
  await page.goto('/');
  await expect(page.locator('#monitor-state')).toHaveAttribute('data-state', 'degraded');
  await expect(page.locator('#monitor-state-label')).toHaveText('ข้อมูลอาจล้าสมัย');
  await expect(page.locator('#dept-connection')).toHaveAttribute('data-state', 'degraded');
  await expect(page.locator('#dept-connection-label')).toHaveText('ข้อมูลอาจล้าสมัย');
  await expect(page.locator('#dept-updated')).toContainText('เกิน 5 นาที');
});
