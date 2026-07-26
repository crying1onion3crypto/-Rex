'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract, ContractListResponse, ContractUploadResponse, ContractStatus } from '@/types';
import { contractApi } from '@/lib/api-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { useToast } from './use-toast';

export function useContracts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all contracts
  const getContracts = useCallback(
    async (params?: {
      page?: number;
      pageSize?: number;
      folderId?: string;
      status?: string;
      search?: string;
      tags?: string[];
    }) => {
      const response = await contractApi.getAll(params);
      return response.data as ContractListResponse;
    },
    []
  );

  // Query for contracts list
  const {
    data: contractsData,
    isLoading: isLoadingContracts,
    error: contractsError,
    refetch: refetchContracts,
  } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => getContracts(),
  });

  // Get contract by ID
  const getContractById = useCallback(
    async (contractId: string) => {
      const response = await contractApi.getById(contractId);
      return response.data as Contract;
    },
    []
  );

  // Upload contract
  const uploadContract = useMutation({
    mutationFn: async (data: { file: File; title?: string; description?: string; folderId?: string }) => {
      const response = await contractApi.upload(data.file, {
        title: data.title,
        description: data.description,
        folderId: data.folderId,
      });
      return response.data as ContractUploadResponse;
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Contract uploaded successfully!',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload contract',
        variant: 'destructive',
      });
    },
  });

  // Create contract (without file)
  const createContract = useMutation({
    mutationFn: async (data: { title: string; description?: string; folderId?: string; tags?: string[] }) => {
      const response = await contractApi.create(data);
      return response.data as ContractUploadResponse;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contract created successfully!',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contract',
        variant: 'destructive',
      });
    },
  });

  // Update contract
  const updateContract = useMutation({
    mutationFn: async ({ contractId, data }: { contractId: string; data: any }) => {
      const response = await contractApi.update(contractId, data);
      return response.data as Contract;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contract updated successfully!',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contract',
        variant: 'destructive',
      });
    },
  });

  // Delete contract
  const deleteContract = useMutation({
    mutationFn: async (contractId: string) => {
      await contractApi.delete(contractId);
      return contractId;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Contract deleted successfully!',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete contract',
        variant: 'destructive',
      });
    },
  });

  // Trigger analysis
  const analyzeContract = useMutation({
    mutationFn: async (contractId: string) => {
      const response = await contractApi.analyze(contractId);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Analysis started successfully!',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start analysis',
        variant: 'destructive',
      });
    },
  });

  // Get contract with analysis
  const getContractWithAnalysis = useCallback(
    async (contractId: string) => {
      const contract = await getContractById(contractId);
      
      if (contract?.hasAnalysis) {
        // If contract has analysis, fetch it
        const analysisResponse = await contractApi.getById(contractId);
        return { contract, analysis: analysisResponse.data };
      }
      
      return { contract, analysis: null };
    },
    [getContractById]
  );

  return {
    // Data
    contractsData,
    isLoadingContracts,
    contractsError,
    
    // Mutations
    uploadContract,
    createContract,
    updateContract,
    deleteContract,
    analyzeContract,
    
    // Functions
    getContracts,
    getContractById,
    getContractWithAnalysis,
    refetchContracts,
    
    // Query client
    queryClient,
  };
}
