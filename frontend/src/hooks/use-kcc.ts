import { useCallback, useEffect, useState } from 'react';
import { kccService } from '@/services/kcc.service';
import type {
  CreateKccConversionRequest,
  CreateKccMangaConversionRequest,
  KccConvertedFile,
  KccJobCreateResponse,
  KccJobSummary,
  KccPreset,
  KccProfile,
} from '@/services';

export function useKcc() {
  const [profiles, setProfiles] = useState<KccProfile[]>([]);
  const [presets, setPresets] = useState<KccPreset[]>([]);
  const [jobs, setJobs] = useState<KccJobSummary[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<KccConvertedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilesData, presetsData, jobsData, convertedData] = await Promise.all([
        kccService.getProfiles(),
        kccService.getPresets(),
        kccService.listJobs(1, 10),
        kccService.listConverted(),
      ]);

      setProfiles(profilesData);
      setPresets(presetsData);
      setJobs(jobsData.jobs);
      setConvertedFiles(convertedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar dados do KCC';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      const data = await kccService.listJobs(1, 10);
      setJobs(data.jobs);
    } catch (err) {
      console.error('[KCC] refreshJobs', err);
    }
  }, []);

  const refreshConverted = useCallback(async () => {
    try {
      const data = await kccService.listConverted();
      setConvertedFiles(data);
    } catch (err) {
      console.error('[KCC] refreshConverted', err);
    }
  }, []);

  const convertManga = useCallback(
    async (payload: CreateKccMangaConversionRequest): Promise<KccJobCreateResponse | null> => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await kccService.createMangaConversion(payload);
        await refreshJobs();
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao criar conversão';
        setError(message);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshJobs],
  );

  const convertChapters = useCallback(
    async (payload: CreateKccConversionRequest): Promise<KccJobCreateResponse | null> => {
      setSubmitting(true);
      setError(null);

      try {
        const response = await kccService.createConversion(payload);
        await refreshJobs();
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao criar conversão de capítulos';
        setError(message);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshJobs],
  );

  const organizeDownloads = useCallback(async (slug?: string) => {
    try {
      const result = await kccService.organizeDownloads(slug);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao organizar downloads';
      setError(message);
      return null;
    }
  }, []);

  const organizeConverted = useCallback(async () => {
    try {
      const result = await kccService.organizeConverted();
      await refreshConverted();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao organizar convertidos';
      setError(message);
      return null;
    }
  }, [refreshConverted]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    profiles,
    presets,
    jobs,
    convertedFiles,
    loading,
    submitting,
    error,
    fetchInitialData,
    refreshJobs,
    refreshConverted,
    convertManga,
    convertChapters,
    organizeDownloads,
    organizeConverted,
  };
}
