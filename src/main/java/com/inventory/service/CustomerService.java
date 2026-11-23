package com.inventory.service;

import com.inventory.dto.CustomerDto;
import com.inventory.entity.Customer;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<CustomerDto.Response> getAllCustomers() {
        return customerRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerDto.Response getCustomerById(Long id) {
        return toResponse(findById(id));
    }

    public CustomerDto.Response createCustomer(CustomerDto.Request request) {
        Customer customer = Customer.builder()
                .customerName(request.getCustomerName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();
        return toResponse(customerRepository.save(customer));
    }

    public CustomerDto.Response updateCustomer(Long id, CustomerDto.Request request) {
        Customer customer = findById(id);
        customer.setCustomerName(request.getCustomerName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        return toResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customerRepository.deleteById(id);
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    private CustomerDto.Response toResponse(Customer c) {
        return CustomerDto.Response.builder()
                .id(c.getId())
                .customerName(c.getCustomerName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .build();
    }
}
