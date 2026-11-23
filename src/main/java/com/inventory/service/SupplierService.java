package com.inventory.service;

import com.inventory.dto.SupplierDto;
import com.inventory.entity.Supplier;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<SupplierDto.Response> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<SupplierDto.Response> searchSuppliers(String name) {
        return supplierRepository.findBySupplierNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SupplierDto.Response getSupplierById(Long id) {
        return toResponse(findById(id));
    }

    public SupplierDto.Response createSupplier(SupplierDto.Request request) {
        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();
        return toResponse(supplierRepository.save(supplier));
    }

    public SupplierDto.Response updateSupplier(Long id, SupplierDto.Request request) {
        Supplier supplier = findById(id);
        supplier.setSupplierName(request.getSupplierName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        return toResponse(supplierRepository.save(supplier));
    }

    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier", id);
        }
        supplierRepository.deleteById(id);
    }

    public Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    private SupplierDto.Response toResponse(Supplier s) {
        return SupplierDto.Response.builder()
                .id(s.getId())
                .supplierName(s.getSupplierName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .build();
    }
}
